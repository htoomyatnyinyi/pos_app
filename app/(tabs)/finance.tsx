import { MOCK_FINANCE_HISTORY, MOCK_PRODUCTS } from "@/services/mock/mockData";
import { SafeAreaView, ScrollView, Text, View } from "react-native";

export default function FinanceScreen() {
  const income = MOCK_FINANCE_HISTORY.filter(
    (record) => record.type === "income",
  ).reduce((sum, record) => sum + record.amount, 0);
  const expense = MOCK_FINANCE_HISTORY.filter(
    (record) => record.type === "expense",
  ).reduce((sum, record) => sum + Math.abs(record.amount), 0);
  const profit = income - expense;
  const totalProducts = MOCK_PRODUCTS.length;

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-6 py-5 bg-white border-b border-slate-200">
        <Text className="text-3xl font-bold text-slate-900">Finance</Text>
        <Text className="text-slate-500 mt-1">
          Track revenue, expenses, and profitability for your mini shop.
        </Text>
      </View>

      <ScrollView className="px-6 pt-4 pb-24">
        <View className="grid-cols-2 gap-4">
          <View className="mb-4 rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
            <Text className="text-slate-500">Revenue</Text>
            <Text className="mt-4 text-3xl font-bold text-slate-900">
              ${income.toFixed(2)}
            </Text>
          </View>
          <View className="mb-4 rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
            <Text className="text-slate-500">Expenses</Text>
            <Text className="mt-4 text-3xl font-bold text-slate-900">
              ${expense.toFixed(2)}
            </Text>
          </View>
          <View className="mb-4 rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
            <Text className="text-slate-500">Profit</Text>
            <Text className="mt-4 text-3xl font-bold text-slate-900">
              ${profit.toFixed(2)}
            </Text>
          </View>
          <View className="mb-4 rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
            <Text className="text-slate-500">Products</Text>
            <Text className="mt-4 text-3xl font-bold text-slate-900">
              {totalProducts}
            </Text>
          </View>
        </View>

        <View className="mt-6 rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
          <Text className="text-xl font-bold text-slate-900">
            Recent records
          </Text>

          {MOCK_FINANCE_HISTORY.map((record) => (
            <View
              key={record.id}
              className="mt-5 flex-row justify-between items-center border-b border-slate-100 pb-4">
              <View>
                <Text className="font-semibold text-slate-900">
                  {record.title}
                </Text>
                <Text className="text-slate-500 mt-1 text-sm">
                  {record.date} · {record.category}
                </Text>
              </View>
              <Text
                className={`font-bold ${
                  record.type === "income"
                    ? "text-emerald-600"
                    : "text-rose-600"
                }`}>
                ${Math.abs(record.amount).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
