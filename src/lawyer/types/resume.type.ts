export type Resume = {
  education: ResumeItem[];
  workExperience: ResumeItem[];
  certifications: ResumeItem[];
};

export type ResumeItem = {
  startYearAt: number;
  endYearAt: number;
  title: string;
  subTitle: string;
  issuedBy: string;
  isVerified?: boolean;
  photos: string[];
};
