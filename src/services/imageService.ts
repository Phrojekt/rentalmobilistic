export const imageService = {
  isBase64Image(str: string): boolean {
    return str.startsWith('data:image');
  },

  // Upload de uma imagem base64 para o Imgur através da nossa API
  async uploadImage(image: string): Promise<string> {
    // Se já for uma URL, retorna ela mesma
    if (!this.isBase64Image(image)) {
      return image;
    }

    try {
      // Remove o prefixo data:image/... do base64
      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Data,
        }),
      });

      const data = await response.json();

      if (data.success) {
        return data.data.link;
      } else {
        throw new Error(data.data?.error || 'Failed to upload image to Imgur');
      }
    } catch (error) {
      console.error('Error uploading image to Imgur:', error);
      throw error;
    }
  },

  // Upload múltiplas imagens
  async uploadImages(base64Images: string[]): Promise<string[]> {
    return await Promise.all(
      base64Images.map(img => this.uploadImage(img))
    );
  }
};
