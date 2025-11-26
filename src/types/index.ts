export type Language = 'zh' | 'en' | 'ko' | 'vi';

export interface CategoryItem {
  id: string;
  title: { [key in Language]: string };
  description: { [key in Language]: string };
  icon: any;
  iconColor?: string;
}

export interface Region {
  name: string;
  cities: string[];
}

export interface Country {
  name: string;
  regions: Region[];
}

export interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}
