interface ApiResponseParams<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string | string[];
}

export const apiResponse = <T>({ success, message, data, error }: ApiResponseParams<T>) => {
  return { success, message, data, error };
};
