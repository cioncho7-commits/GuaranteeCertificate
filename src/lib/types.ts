export type ConsentRecord = {
  userId: string;
  requiredAgreed: boolean;
  marketingAgreed: boolean;
  agreedAt: string;
};

// 세금계산서 등록 정보 (건설기계 임대차 당사자 정보)
export type TaxInvoiceProfile = {
  id: string;
  ownerId: string;
  lesseeName: string; // 건설기계임차인명
  lessorCompanyName: string; // 건설기계임대인명 - 사업자등록증상 회사명
  lessorRepName: string; // 건설기계임대인명 - 대표자명
  vehicleNumber: string; // 차량번호
  businessRegNumber: string; // 사업자등록번호
  repPhone: string; // 대표자 휴대폰번호
  createdAt: string;
};

// 계약서 등록 정보
export type ContractProfile = {
  id: string;
  ownerId: string;
  periodStart: string; // 계약기간 시작일
  periodEnd: string; // 계약기간 종료일
  unitPrice: string; // 단가
  paymentDueTerms: string; // 결제기한
  createdAt: string;
};

export type ManagerContact = {
  id: string;
  ownerId: string;
  name: string;
  email: string;
  createdAt: string;
};

export type Submission = {
  id: string;
  ownerId: string;
  siteName: string; // 현장명
  clientName: string; // 원청명
  taxInvoice: TaxInvoiceProfile;
  contract: ContractProfile;
  managerEmail: string;
  emailStatus: "sent" | "failed" | "not_configured";
  emailDetail?: string;
  createdAt: string;
};

export type Database = {
  consents: ConsentRecord[];
  taxInvoiceProfiles: TaxInvoiceProfile[];
  contractProfiles: ContractProfile[];
  managerContacts: ManagerContact[];
  submissions: Submission[];
};
