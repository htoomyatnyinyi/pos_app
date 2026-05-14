import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal, TextInput, ActivityIndicator } from "react-native";
import { useAppDispatch } from "@/hooks/redux-hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/redux-hooks/useAppSelector";
import { logout } from "@/services/features/auth/authSlice";
import { useGetProductsQuery } from "@/services/features/products/productApi";
import { useGetOrdersQuery } from "@/services/features/order/orderApi";
import { useGetActiveSessionQuery, useOpenSessionMutation, useCloseSessionMutation } from "@/services/features/sessions/sessionApi";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp, Layout } from "react-native-reanimated";
import { useGetStaffQuery, useCreateStaffMutation, useUpdateStaffMutation, useDeleteStaffMutation } from "@/services/features/staff/staffApi";
import { useGetCustomersQuery, useCreateCustomerMutation, useUpdateCustomerMutation } from "@/services/features/customers/customerApi";
import { useGetSuppliersQuery, useCreateSupplierMutation, useUpdateSupplierMutation } from "@/services/features/suppliers/supplierApi";
import { useGetStoresQuery, useUpdateStoreMutation } from "@/services/features/stores/storeApi";
import { useGetCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation } from "@/services/features/categories/categoryApi";

export default function SettingsScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  
  const { data: products } = useGetProductsQuery();
  const { data: orders } = useGetOrdersQuery();

  // Shift Management State
  const { data: activeSession, isLoading: isLoadingSession, refetch: refetchSession } = useGetActiveSessionQuery(user?.id || "", { skip: !user?.id });
  const [openSession, { isLoading: isOpening }] = useOpenSessionMutation();
  const [closeSession, { isLoading: isClosing }] = useCloseSessionMutation();

  const [isShiftModalVisible, setIsShiftModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"OPEN" | "CLOSE">("OPEN");
  const [balanceInput, setBalanceInput] = useState("");

  // Management State
  const [activeManageModal, setActiveManageModal] = useState<"STAFF" | "CUSTOMERS" | "SUPPLIERS" | "STORE" | "CATEGORIES" | null>(null);
  
  // API Hooks for Management
  const { data: staffList } = useGetStaffQuery();
  const { data: customerList } = useGetCustomersQuery();
  const { data: supplierList } = useGetSuppliersQuery();
  const { data: storeList } = useGetStoresQuery();
  const { data: categoryList } = useGetCategoriesQuery();

  const [createStaff] = useCreateStaffMutation();
  const [updateStaff] = useUpdateStaffMutation();
  const [updateStore] = useUpdateStoreMutation();
  const [createCustomer] = useCreateCustomerMutation();
  const [updateCustomer] = useUpdateCustomerMutation();
  const [createSupplier] = useCreateSupplierMutation();
  const [updateSupplier] = useUpdateSupplierMutation();
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formValue1, setFormValue1] = useState(""); // Email/Phone/Address
  const [formValue2, setFormValue2] = useState(""); // Role/Tax/Contact
  
  const [deleteStaff] = useDeleteStaffMutation();
  
  const handleSaveStore = async () => {
    if (!storeList?.[0]) return;
    try {
      await updateStore({
        id: storeList[0].id,
        data: { name: formName, address: formValue1, phone: formValue2 }
      }).unwrap();
      Alert.alert("Success", "Store profile updated.");
      setActiveManageModal(null);
    } catch {
      Alert.alert("Error", "Failed to update store.");
    }
  };

  const handleSaveStaff = async () => {
    try {
      if (editingId) {
        await updateStaff({ id: editingId, data: { name: formName, email: formValue1, role: formValue2 as any, permissions: [] } }).unwrap();
      } else {
        await createStaff({ name: formName, email: formValue1, username: formName.toLowerCase().replace(" ", ""), password: "password123", role: formValue2 as any, permissions: [] }).unwrap();
      }
      Alert.alert("Success", "Staff member saved.");
      setEditingId(null); setFormName(""); setFormValue1(""); setFormValue2("");
    } catch {
      Alert.alert("Error", "Failed to save staff member.");
    }
  };

  const handleSaveCustomer = async () => {
    try {
      if (editingId) {
        await updateCustomer({ id: editingId, data: { name: formName, phone: formValue1, address: formValue2 } }).unwrap();
      } else {
        await createCustomer({ name: formName, phone: formValue1, address: formValue2 }).unwrap();
      }
      Alert.alert("Success", "Customer saved.");
      setEditingId(null); setFormName(""); setFormValue1(""); setFormValue2("");
    } catch {
      Alert.alert("Error", "Failed to save customer.");
    }
  };

  const handleSaveSupplier = async () => {
    try {
      if (editingId) {
        await updateSupplier({ id: editingId, data: { name: formName, contactName: formValue1, phone: formValue2 } }).unwrap();
      } else {
        await createSupplier({ name: formName, contactName: formValue1, phone: formValue2 }).unwrap();
      }
      Alert.alert("Success", "Supplier saved.");
      setEditingId(null); setFormName(""); setFormValue1(""); setFormValue2("");
    } catch {
      Alert.alert("Error", "Failed to save supplier.");
    }
  };

  const handleSaveCategory = async () => {
    try {
      if (editingId) {
        await updateCategory({ id: editingId, data: { name: formName, slug: formName.toLowerCase().replace(/ /g, "-") } }).unwrap();
      } else {
        await createCategory({ name: formName, slug: formName.toLowerCase().replace(/ /g, "-") }).unwrap();
      }
      Alert.alert("Success", "Category saved.");
      setEditingId(null); setFormName(""); setFormValue1(""); setFormValue2("");
    } catch {
      Alert.alert("Error", "Failed to save category.");
    }
  };


  const handleDeleteStaff = async (id: string) => {
    Alert.alert("Confirm Delete", "Are you sure you want to remove this staff member?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          try {
            await deleteStaff(id).unwrap();
            Alert.alert("Deleted", "Staff member removed.");
          } catch {
            Alert.alert("Error", "Failed to delete staff member.");
          }
        } 
      }
    ]);
  };

  const handleShiftAction = async () => {
    if (!balanceInput || isNaN(Number(balanceInput))) {
      Alert.alert("Invalid Amount", "Please enter a valid cash amount.");
      return;
    }
    const balance = Number(balanceInput);
    try {
      if (!user) return;
      if (modalMode === "OPEN") {
        await openSession({ userId: user.id, openingBalance: balance, notes: "Opened via mobile terminal" }).unwrap();
        Alert.alert("Shift Opened", "You can now process transactions.");
      } else {
        await closeSession({ sessionId: activeSession!.id, data: { closingBalance: balance, notes: "Closed via mobile terminal" } }).unwrap();
        Alert.alert("Shift Closed", "Shift ended successfully.");
        dispatch(logout()); // Auto logout after closing shift
      }
      setIsShiftModalVisible(false);
      setBalanceInput("");
      refetchSession();
    } catch (error) {
      Alert.alert("Error", `Failed to ${modalMode.toLowerCase()} shift.`);
    }
  };

  const handleLogout = () => {
    if (activeSession) {
      Alert.alert("Active Shift", "You have an active shift. Please end your shift before signing out.", [
        { text: "Cancel", style: "cancel" },
        { text: "End Shift", onPress: () => { setModalMode("CLOSE"); setIsShiftModalVisible(true); } }
      ]);
      return;
    }
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => dispatch(logout()) },
    ]);
  };

  const SettingItem = ({ emoji, title, subtitle, onPress, delay = 0 }: any) => (
    <Animated.View entering={FadeInDown.duration(400).delay(delay)}>
      <TouchableOpacity activeOpacity={0.8} onPress={onPress} className="flex-row items-center bg-[#252833] p-5 rounded-[28px] mb-4 border border-slate-800/50">
        <View className="w-12 h-12 bg-[#1a1c24] rounded-2xl items-center justify-center mr-4 border border-slate-800">
          <Text className="text-xl opacity-70">{emoji}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-slate-100 font-bold text-base">{title}</Text>
          {subtitle && <Text className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-1">{subtitle}</Text>}
        </View>
        <Text className="text-slate-700 text-2xl font-bold">›</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const totalSales = orders?.reduce((sum, order) => sum + Number(order.grandTotal || 0), 0) || 0;
  const activeProducts = products?.filter(p => p.stockQuantity > 0).length || 0;

  return (
    <SafeAreaView className="flex-1 bg-[#1a1c24]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Profile Card */}
        <Animated.View entering={FadeInDown.duration(500)}>
          <View className="bg-[#252833] m-6 p-8 rounded-[40px] items-center border border-slate-800/50 shadow-2xl">
            <View className="w-24 h-24 bg-indigo-600 rounded-[32px] items-center justify-center mb-5 shadow-2xl shadow-indigo-600/30">
              <Text className="text-white text-4xl font-black">{user?.name?.charAt(0).toUpperCase() || "U"}</Text>
            </View>
            <Text className="text-slate-100 text-3xl font-bold tracking-tight">{user?.name || "User"}</Text>
            <Text className="text-slate-500 font-bold text-xs uppercase tracking-[3px] mt-2">{user?.email || "Terminal Operator"}</Text>
            
            {/* Shift Status Indicator */}
            {isLoadingSession ? (
               <ActivityIndicator color="#6366f1" style={{ marginTop: 24 }} />
            ) : activeSession ? (
              <View className="flex-row items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20 mt-6">
                <View className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" />
                <Text className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Active Shift</Text>
              </View>
            ) : (
              <TouchableOpacity 
                onPress={() => { setModalMode("OPEN"); setIsShiftModalVisible(true); }}
                className="flex-row items-center gap-2 bg-amber-500/10 px-6 py-3 rounded-full border border-amber-500/20 mt-6"
              >
                <View className="w-2 h-2 rounded-full bg-amber-500 shadow-sm" />
                <Text className="text-amber-400 text-[10px] font-black uppercase tracking-widest">Start Shift</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Dashboard Stats */}
        {activeSession && (
          <Animated.View entering={FadeInDown.duration(400).delay(50)} className="px-6 flex-row gap-4 mb-8">
            <View className="flex-1 bg-indigo-500/10 p-5 rounded-[28px] border border-indigo-500/20">
              <Text className="text-indigo-400 font-bold text-[9px] uppercase tracking-widest mb-2">Total Sales</Text>
              <Text className="text-indigo-300 font-black text-2xl">${totalSales.toFixed(2)}</Text>
            </View>
            <View className="flex-1 bg-[#252833] p-5 rounded-[28px] border border-slate-800/50">
              <Text className="text-slate-500 font-bold text-[9px] uppercase tracking-widest mb-2">Active Products</Text>
              <Text className="text-slate-100 font-black text-2xl">{activeProducts}</Text>
            </View>
          </Animated.View>
        )}

        <View className="px-6 mb-8">
          <Text className="text-slate-600 text-[10px] font-black uppercase tracking-[4px] mb-5 ml-4">Management</Text>
          <SettingItem emoji="🏪" title="Store Profile" subtitle="General Configuration" delay={100} onPress={() => { 
            setActiveManageModal("STORE"); 
            if (storeList?.[0]) {
              setFormName(storeList[0].name);
              setFormValue1(storeList[0].address || "");
              setFormValue2(storeList[0].phone || "");
            }
          }} />
          <SettingItem emoji="👥" title="Staff Members" subtitle="Roles & Permissions" delay={150} onPress={() => { setActiveManageModal("STAFF"); setEditingId(null); setFormName(""); setFormValue1(""); setFormValue2(""); }} />
          <SettingItem emoji="🤝" title="Suppliers" subtitle="Inventory Partners" delay={200} onPress={() => { setActiveManageModal("SUPPLIERS"); setEditingId(null); setFormName(""); setFormValue1(""); setFormValue2(""); }} />
          <SettingItem emoji="💎" title="Customers" subtitle="Loyalty Program" delay={250} onPress={() => { setActiveManageModal("CUSTOMERS"); setEditingId(null); setFormName(""); setFormValue1(""); setFormValue2(""); }} />
          <SettingItem emoji="📁" title="Categories" subtitle="Product Groups" delay={300} onPress={() => { setActiveManageModal("CATEGORIES"); setEditingId(null); setFormName(""); setFormValue1(""); setFormValue2(""); }} />
        </View>

        <View className="px-6 mb-10">
          <Text className="text-slate-600 text-[10px] font-black uppercase tracking-[4px] mb-5 ml-4">Terminal</Text>
          <SettingItem emoji="🎨" title="Appearance" subtitle="Eye Comfort Theme" delay={250} />
          <SettingItem emoji="🔒" title="Security" subtitle="Pin & Biometrics" delay={300} />
        </View>

        <Animated.View entering={FadeInDown.duration(400).delay(350)} className="px-6">
          <TouchableOpacity onPress={handleLogout} className="bg-rose-500/10 p-6 rounded-[28px] flex-row items-center justify-center border border-rose-500/20">
            <Text className="text-rose-400 font-black text-lg tracking-tight">{activeSession ? "End Shift & Sign Out" : "Sign Out"}</Text>
          </TouchableOpacity>
        </Animated.View>

        <View className="items-center mt-12 opacity-20">
          <Text className="text-slate-100 font-black text-[9px] uppercase tracking-[5px]">MidnightCorner POS v1.0</Text>
        </View>
      </ScrollView>

      {/* Shift Management Modal */}
      <Modal visible={isShiftModalVisible} animationType="fade" transparent={true}>
        <View className="flex-1 bg-black/80 items-center justify-center p-6">
          <Animated.View entering={FadeInUp.duration(300)} className="bg-[#252833] w-full max-w-sm rounded-[40px] p-8 items-center border border-slate-700 shadow-2xl">
            <View className={`w-16 h-16 rounded-3xl items-center justify-center mb-6 ${modalMode === "OPEN" ? "bg-amber-500/20" : "bg-rose-500/20"}`}>
              <Text className="text-3xl">💵</Text>
            </View>
            <Text className="text-2xl font-black text-white text-center mb-2">
              {modalMode === "OPEN" ? "Start Shift" : "End Shift"}
            </Text>
            <Text className="text-slate-400 font-bold text-center text-xs px-4 mb-8 leading-5">
              {modalMode === "OPEN" ? "Please count the cash drawer and enter the opening balance to begin." : "Count the physical cash in the drawer and enter the final closing balance."}
            </Text>
            
            <View className="w-full mb-8 relative">
              <Text className="absolute left-6 top-[18px] text-2xl font-black text-slate-500 z-10">$</Text>
              <TextInput
                value={balanceInput} onChangeText={setBalanceInput}
                keyboardType="numeric" placeholder="0.00" placeholderTextColor="#475569"
                className="w-full bg-[#1a1c24] border border-slate-700 rounded-2xl py-4 pl-12 pr-6 text-white text-2xl font-black"
              />
            </View>

            <View className="w-full flex-row gap-4">
              <TouchableOpacity onPress={() => setIsShiftModalVisible(false)} className="flex-1 py-5 rounded-2xl items-center border border-slate-700 bg-[#1a1c24]">
                <Text className="text-white font-black">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShiftAction} disabled={isOpening || isClosing} className={`flex-1 py-5 rounded-2xl items-center ${modalMode === "OPEN" ? "bg-amber-600" : "bg-rose-600"}`}>
                {isOpening || isClosing ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-black">{modalMode === "OPEN" ? "Open" : "Close"}</Text>}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
      
      {/* Management Container Modal */}
      <Modal visible={!!activeManageModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setActiveManageModal(null)}>
        <View className="flex-1 bg-[#1a1c24]">
          <View className="px-6 py-6 bg-[#1a1c24] border-b border-slate-800 flex-row justify-between items-center z-10">
            <Text className="text-2xl font-black text-slate-100">
              {activeManageModal === "STAFF" && "Staff Members"}
              {activeManageModal === "CUSTOMERS" && "Customers"}
              {activeManageModal === "SUPPLIERS" && "Suppliers"}
              {activeManageModal === "STORE" && "Store Profile"}
              {activeManageModal === "CATEGORIES" && "Categories"}
            </Text>
            <TouchableOpacity onPress={() => setActiveManageModal(null)} className="bg-slate-800 w-10 h-10 rounded-full items-center justify-center">
              <Text className="text-slate-400 font-bold text-xl">×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 100 }}>
            {activeManageModal === "STAFF" && (
              <View>
                <View className="bg-[#252833] p-6 rounded-[32px] mb-8 border border-slate-800">
                  <Text className="text-slate-400 font-bold text-xs mb-4">{editingId ? "Edit Staff" : "Add New Staff"}</Text>
                  <FormField label="Full Name" value={formName} onChangeText={setFormName} placeholder="Staff Name" />
                  <View className="mt-4">
                    <FormField label="Email Address" value={formValue1} onChangeText={setFormValue1} placeholder="email@midnight.com" />
                  </View>
                  <View className="mt-4">
                    <FormField label="Role (ADMIN, MANAGER, CASHIER)" value={formValue2} onChangeText={setFormValue2} placeholder="CASHIER" />
                  </View>
                  <TouchableOpacity onPress={handleSaveStaff} className="mt-6 bg-indigo-600 py-4 rounded-2xl items-center shadow-lg">
                    <Text className="text-white font-black">{editingId ? "Update Staff" : "Add Staff"}</Text>
                  </TouchableOpacity>
                  {editingId && (
                    <TouchableOpacity onPress={() => { setEditingId(null); setFormName(""); setFormValue1(""); setFormValue2(""); }} className="mt-3 py-2 items-center">
                      <Text className="text-slate-500 font-bold">Cancel Edit</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {staffList?.map((staff) => (
                  <View key={staff.id} className="bg-[#252833] p-5 rounded-[28px] mb-4 border border-slate-800 flex-row items-center">
                    <View className="w-12 h-12 bg-[#1a1c24] rounded-2xl items-center justify-center mr-4 border border-slate-800">
                      <Text className="text-xl">👤</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-slate-100 font-bold text-lg">{staff.name}</Text>
                      <Text className="text-indigo-400 font-bold text-[10px] uppercase tracking-widest">{staff.role}</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <TouchableOpacity 
                        onPress={() => { setEditingId(staff.id); setFormName(staff.name); setFormValue1(staff.email || ""); setFormValue2(staff.role); }}
                        className="bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700"
                      >
                        <Text className="text-slate-400 font-bold text-xs">Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => handleDeleteStaff(staff.id)}
                        className="bg-rose-500/10 px-4 py-2 rounded-xl border border-rose-500/20"
                      >
                        <Text className="text-rose-400 font-bold text-xs">Del</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {activeManageModal === "CUSTOMERS" && (
              <View>
                <View className="bg-[#252833] p-6 rounded-[32px] mb-8 border border-slate-800">
                  <Text className="text-slate-400 font-bold text-xs mb-4">{editingId ? "Edit Customer" : "Add New Customer"}</Text>
                  <FormField label="Full Name" value={formName} onChangeText={setFormName} placeholder="Customer Name" />
                  <View className="mt-4">
                    <FormField label="Phone Number" value={formValue1} onChangeText={setFormValue1} placeholder="+95 ..." />
                  </View>
                  <View className="mt-4">
                    <FormField label="Address" value={formValue2} onChangeText={setFormValue2} placeholder="Address" multiline />
                  </View>
                  <TouchableOpacity onPress={handleSaveCustomer} className="mt-6 bg-indigo-600 py-4 rounded-2xl items-center shadow-lg">
                    <Text className="text-white font-black">{editingId ? "Update Customer" : "Add Customer"}</Text>
                  </TouchableOpacity>
                  {editingId && (
                    <TouchableOpacity onPress={() => { setEditingId(null); setFormName(""); setFormValue1(""); setFormValue2(""); }} className="mt-3 py-2 items-center">
                      <Text className="text-slate-500 font-bold">Cancel Edit</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {customerList?.map((cust) => (
                  <View key={cust.id} className="bg-[#252833] p-5 rounded-[28px] mb-4 border border-slate-800 flex-row items-center">
                    <View className="w-12 h-12 bg-[#1a1c24] rounded-2xl items-center justify-center mr-4 border border-slate-800">
                      <Text className="text-xl">💎</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-slate-100 font-bold text-lg">{cust.name}</Text>
                      <Text className="text-slate-500 font-bold text-[10px] tracking-widest uppercase">{cust.phone || "No Phone"}</Text>
                    </View>
                    <View className="items-end mr-4">
                      <Text className="text-emerald-400 font-black">{cust.loyaltyPoints} pts</Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => { setEditingId(cust.id); setFormName(cust.name); setFormValue1(cust.phone || ""); setFormValue2(cust.address || ""); }}
                      className="bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700"
                    >
                      <Text className="text-slate-400 font-bold text-xs">Edit</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {activeManageModal === "SUPPLIERS" && (
              <View>
                <View className="bg-[#252833] p-6 rounded-[32px] mb-8 border border-slate-800">
                  <Text className="text-slate-400 font-bold text-xs mb-4">{editingId ? "Edit Supplier" : "Add New Supplier"}</Text>
                  <FormField label="Supplier Name" value={formName} onChangeText={setFormName} placeholder="Company Name" />
                  <View className="mt-4">
                    <FormField label="Contact Person" value={formValue1} onChangeText={setFormValue1} placeholder="Name" />
                  </View>
                  <View className="mt-4">
                    <FormField label="Phone Number" value={formValue2} onChangeText={setFormValue2} placeholder="+95 ..." />
                  </View>
                  <TouchableOpacity onPress={handleSaveSupplier} className="mt-6 bg-indigo-600 py-4 rounded-2xl items-center shadow-lg">
                    <Text className="text-white font-black">{editingId ? "Update Supplier" : "Add Supplier"}</Text>
                  </TouchableOpacity>
                  {editingId && (
                    <TouchableOpacity onPress={() => { setEditingId(null); setFormName(""); setFormValue1(""); setFormValue2(""); }} className="mt-3 py-2 items-center">
                      <Text className="text-slate-500 font-bold">Cancel Edit</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {supplierList?.map((sup) => (
                  <View key={sup.id} className="bg-[#252833] p-5 rounded-[28px] mb-4 border border-slate-800 flex-row items-center">
                    <View className="w-12 h-12 bg-[#1a1c24] rounded-2xl items-center justify-center mr-4 border border-slate-800">
                      <Text className="text-xl">🤝</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-slate-100 font-bold text-lg">{sup.name}</Text>
                      <Text className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">{sup.contactName || "Global Provider"}</Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => { setEditingId(sup.id); setFormName(sup.name); setFormValue1(sup.contactName || ""); setFormValue2(sup.phone || ""); }}
                      className="bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700"
                    >
                      <Text className="text-slate-400 font-bold text-xs">Edit</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {activeManageModal === "STORE" && storeList && storeList.length > 0 && (
              <View className="bg-[#252833] p-8 rounded-[40px] border border-slate-800">
                <FormField label="Store Name" value={formName} onChangeText={setFormName} placeholder="e.g. MidnightCorner Downtown" />
                <View className="mt-6">
                  <FormField label="Address" value={formValue1} onChangeText={setFormValue1} placeholder="Street Address" multiline />
                </View>
                <View className="mt-6">
                  <FormField label="Phone Number" value={formValue2} onChangeText={setFormValue2} placeholder="+95 ..." />
                </View>
                <TouchableOpacity onPress={handleSaveStore} className="mt-10 bg-indigo-600 py-6 rounded-[28px] items-center shadow-2xl shadow-indigo-600/30">
                  <Text className="text-white font-black text-lg">Save Profile</Text>
                </TouchableOpacity>
              </View>
            )}

            {activeManageModal === "CATEGORIES" && (
              <View>
                <View className="bg-[#252833] p-6 rounded-[32px] mb-8 border border-slate-800">
                  <Text className="text-slate-400 font-bold text-xs mb-4">{editingId ? "Edit Category" : "Add New Category"}</Text>
                  <FormField label="Category Name" value={formName} onChangeText={setFormName} placeholder="Category Name" />
                  <TouchableOpacity onPress={handleSaveCategory} className="mt-6 bg-indigo-600 py-4 rounded-2xl items-center shadow-lg">
                    <Text className="text-white font-black">{editingId ? "Update Category" : "Add Category"}</Text>
                  </TouchableOpacity>
                  {editingId && (
                    <TouchableOpacity onPress={() => { setEditingId(null); setFormName(""); setFormValue1(""); setFormValue2(""); }} className="mt-3 py-2 items-center">
                      <Text className="text-slate-500 font-bold">Cancel Edit</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {categoryList?.map((cat) => (
                  <View key={cat.id} className="bg-[#252833] p-5 rounded-[28px] mb-4 border border-slate-800 flex-row items-center">
                    <View className="w-12 h-12 bg-[#1a1c24] rounded-2xl items-center justify-center mr-4 border border-slate-800">
                      <Text className="text-xl">📁</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-slate-100 font-bold text-lg">{cat.name}</Text>
                      <Text className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">{cat.slug}</Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => { setEditingId(cat.id); setFormName(cat.name); }}
                      className="bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700"
                    >
                      <Text className="text-slate-400 font-bold text-xs">Edit</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

function FormField({ label, value, onChangeText, placeholder, keyboard, multiline }: any) {
  return (
    <View>
      <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2.5 ml-1">{label}</Text>
      <TextInput
        placeholder={placeholder} value={value} onChangeText={onChangeText} placeholderTextColor="#475569"
        keyboardType={keyboard || "default"} multiline={multiline} numberOfLines={multiline ? 3 : 1}
        className={`bg-[#1a1c24] px-5 py-4 rounded-2xl border border-slate-800 font-bold text-slate-100 ${multiline ? 'min-h-[100px]' : ''}`}
        style={multiline ? { textAlignVertical: "top" } : {}}
      />
    </View>
  );
}
