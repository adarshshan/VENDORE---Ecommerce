export interface ApiResponse<T = any> {
  status: 'success' | 'failed';
  message: string;
  data?: T;
}
