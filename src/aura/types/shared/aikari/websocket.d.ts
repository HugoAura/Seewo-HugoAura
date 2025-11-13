interface ClientAikariRequest {
  method: string;
  data: Record<any, any>;
  eventId: string;
  module: string;
}

interface AikariResponse {
  success: boolean;
  code: number;
  data: Record<any, any>;
  eventId: string;
}

interface AikariPush {
  success: boolean;
  type: string;
  data: Record<any, any>;
}
