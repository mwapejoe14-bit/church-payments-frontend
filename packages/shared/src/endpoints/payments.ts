import { getApi } from "../api";
import type {
  ApiResponse,
  BatchPaymentPayload,
  PaymentBatch,
  PaymentPayload,
  Transaction,
} from "../types";

export const paymentsApi = {
  async makePayment(payload: PaymentPayload): Promise<Transaction> {
    const { data } = await getApi().post<ApiResponse<Transaction>>(
      "/payments",
      payload
    );
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async makeBatchPayment(
    payload: BatchPaymentPayload
  ): Promise<{ batch: PaymentBatch; transactions: Transaction[] }> {
    const { data } = await getApi().post<
      ApiResponse<{ batch: PaymentBatch; transactions: Transaction[] }>
    >("/payments/batch", payload);
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getBatch(batchId: string): Promise<PaymentBatch> {
    const { data } = await getApi().get<ApiResponse<PaymentBatch>>(
      `/payments/batch/${batchId}`
    );
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getMyPayments(): Promise<Transaction[]> {
    const { data } = await getApi().get<ApiResponse<Transaction[]>>(
      "/payments/my-payments"
    );
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getAllPayments(): Promise<Transaction[]> {
    const { data } = await getApi().get<ApiResponse<Transaction[]>>(
      "/payments/admin/all"
    );
    if (!data.success) throw new Error(data.message);
    return data.data;
  },
};