export type ButtonStyle = 1 | 2 | 3 | 4 | 5;

export interface BtnData {
  id: string;
  style: ButtonStyle;
  label: string;
  emoji: string;
  custom_id: string;
  url: string;
  disabled: boolean;
}

export interface MediaItemData {
  id: string;
  url: string;
  description: string;
  spoiler: boolean;
}

export type CompType = 10 | 1 | 12 | 13 | 14;

export interface CompData {
  id: string;
  type: CompType;
  content: string;
  buttons: BtnData[];
  items: MediaItemData[];
  fileUrl: string;
  fileSpoiler: boolean;
  divider: boolean;
  spacing: 1 | 2;
}

export interface ContainerData {
  id: string;
  accentColor: number | null;
  spoiler: boolean;
  components: CompData[];
}
