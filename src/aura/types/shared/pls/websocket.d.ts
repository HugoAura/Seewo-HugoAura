interface ClientPLSRequest {
  method: string;
  data: Record<any, any>;
  eventId: string;
}

interface PLSResponse {
  success: boolean;
  code: number;
  data: Record<any, any>;
  eventId: string;
}

interface PLSPush {
  success: boolean;
  type: string;
  data: Record<any, any>;
}
