export type Volume = {
  name: string;
  currentSizeMB: number;
  sizeMB: number;
};

export type Source = {
  image: string | null;
  repo: string | null;
};

export type Service = {
  id: string;
  name: string;
  icon: string;
  volume?: Volume;
  domains: string[];
  source: Source;
  connections: string[]; // service ids
};

// Client-friendly interface for processed railway data
export interface RailwayData {
  projectName: string;
  services: Service[];
}
