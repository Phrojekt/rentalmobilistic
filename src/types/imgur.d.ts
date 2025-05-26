declare module 'imgur' {
  interface ImgurClientOptions {
    clientId: string;
  }

  interface UploadOptions {
    image: string;
    type: 'url' | 'base64';
  }

  interface UploadResponse {
    success: boolean;
    status: number;
    data: {
      id: string;
      link: string;
      deletehash?: string;
    };
  }

  export class ImgurClient {
    constructor(options: ImgurClientOptions);
    upload(options: UploadOptions): Promise<UploadResponse>;
  }
}
