import { posApi } from "@/services/api/posApi";
import { Session, OpenSessionPayload, CloseSessionPayload } from "./sessionTypes";

export const sessionApi = posApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getActiveSession: builder.query<Session, string>({
      query: (userId) => `/sessions/active/${userId}`,
      providesTags: ["Sessions"],
    }),

    openSession: builder.mutation<Session, OpenSessionPayload>({
      query: (body) => ({
        url: "/sessions/open",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Sessions"],
    }),

    closeSession: builder.mutation<Session, { sessionId: string; data: CloseSessionPayload }>({
      query: ({ sessionId, data }) => ({
        url: `/sessions/${sessionId}/close`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Sessions"],
    }),
  }),
});

export const {
  useGetActiveSessionQuery,
  useOpenSessionMutation,
  useCloseSessionMutation,
} = sessionApi;
