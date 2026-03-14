export interface Client {
  id: number;
  name: string;
  contact: string;
  notes: string;
  created_at: string;
}

export interface Service {
  id: number;
  client_id: number;
  client_name?: string;
  name: string;
  status: 'ongoing' | 'finished';
  total_value: number;
  paid_value: number;
  created_at: string;
}

export interface GalleryImage {
  id: number;
  gallery_id: number;
  url: string;
}

export interface GalleryItem {
  id: number;
  title: string;
  description?: string;
  type: 'image' | 'video';
  url: string;
  images?: GalleryImage[];
  created_at: string;
}

export interface Stats {
  clients: number;
  services: number;
  finances: {
    total: number;
    paid: number;
    remaining: number;
  };
}
