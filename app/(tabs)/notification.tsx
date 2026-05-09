import { MOCK_NOTIFICATIONS } from "@/services/mock/mockData";
import { SafeAreaView, ScrollView, Text, View } from "react-native";

export default function NotificationScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-6 py-5 bg-white border-b border-slate-200">
        <Text className="text-3xl font-bold text-slate-900">History</Text>
        <Text className="text-slate-500 mt-1">
          Review recent shop activity and notifications.
        </Text>
      </View>

      <ScrollView className="px-6 pt-4 pb-24">
        {MOCK_NOTIFICATIONS.map((item) => (
          <View
            key={item.id}
            className="mb-4 rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
            <View className="flex-row justify-between items-start gap-4">
              <View className="flex-1">
                <Text className="text-lg font-bold text-slate-900">
                  {item.title}
                </Text>
                <Text className="text-slate-500 mt-1">{item.description}</Text>
              </View>
              <View className="rounded-2xl bg-slate-100 px-3 py-2">
                <Text className="text-slate-600 text-sm">{item.time}</Text>
              </View>
            </View>
          </View>
        ))}

        <View className="mt-10 rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
          <Text className="text-slate-900 font-bold text-lg">
            History Notes
          </Text>
          <Text className="text-slate-500 mt-3">
            Mock notifications are stored locally for the demo. When the API is
            ready, these history items can be replaced with order and stock
            events from your server.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
