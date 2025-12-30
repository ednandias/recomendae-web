import { AxiosError, type AxiosResponse } from "axios";
import { toast } from "react-toastify";

interface APIResponse extends AxiosResponse {
  data: {
    message: string;
  };
}

type APIError = AxiosError &
  Error & {
    response: APIResponse;
  };

export function showAPIError(error: unknown, message: string) {
  const err = error as APIError;

  if (err.code === "ERR_CANCELED" && err.isAxiosError) {
    return;
  }

  if (err.response?.data.message) {
    const errMessage = err.response.data.message;

    return toast.error(errMessage);
  } else {
    const errMessage = String(err.cause) === "custom" ? err.message : message;

    return toast.error(errMessage);
  }
}

export function getAPIError(error: unknown, message: string) {
  const err = error as APIError;

  if (err.response?.data.message) {
    const errMessage = err.response.data.message;

    return errMessage;
  } else {
    return message;
  }
}
