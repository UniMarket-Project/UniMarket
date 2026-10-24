import type {
  UserType,
  Role,
  VerificationStatus,
  AvailabilityStatus,
  ListingType,
  ListingStatus,
  RequestType,
  RequestStatus,
  TransactionStatus,
  PaymentMethod,
  ReportType,
  ReportCategory,
  ReportStatus,
  NotificationType,
} from "../enums/index.js";

export interface LocationDto {
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
}

export interface UserSummary {
  userId: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  verificationStatus: VerificationStatus;
  averageRating: number;
  totalRatings: number;
  totalTransactions: number;
}

export interface AuthUserDto {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  role: Role;
  verificationStatus: VerificationStatus;
}

export interface AuthResponseData {
  user: AuthUserDto;
  accessToken: string;
  expiresIn: number;
  refreshToken?: string;
}

export interface UserProfileDto {
  userId: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  role: Role;
  verificationStatus: VerificationStatus;
  avatarUrl: string | null;
  bio: string | null;
  availabilityStatus: AvailabilityStatus;
  location: LocationDto;
  joinedAt: string;
  profile: {
    averageRating: number;
    totalRatings: number;
    totalTransactions: number;
    totalReviews: number;
  };
}

export interface PublicUserProfileDto {
  userId: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  verificationStatus: VerificationStatus;
  avatarUrl: string | null;
  bio: string | null;
  availabilityStatus: AvailabilityStatus;
  joinedAt: string;
  profile: {
    averageRating: number;
    totalRatings: number;
    totalTransactions: number;
  };
}

export interface ListingSummary {
  listingId: string;
  title: string;
  category: string;
  transactionType: ListingType;
  price: number | null;
  currency: string;
  images: string[];
  availabilityStatus: AvailabilityStatus;
  location?: LocationDto | null;
  createdBy: UserSummary;
  createdAt: string;
}

export interface ListingDetail extends ListingSummary {
  description: string;
  quantityAvailable: number;
  rentalStartDate?: string | null;
  rentalEndDate?: string | null;
  metadata?: Record<string, unknown>;
  viewCount: number;
  status: ListingStatus;
  updatedAt: string;
  expiresAt: string;
  createdBy: UserSummary & {
    bio?: string | null;
    joinedAt: string;
  };
}

export interface RequestObject {
  requestId: string;
  title: string;
  description: string;
  category: string;
  type: RequestType;
  status: RequestStatus;
  budgetMin: number | null;
  budgetMax: number | null;
  exchangeHave: string | null;
  exchangeWant: string | null;
  location?: LocationDto | null;
  createdBy: UserSummary;
  createdAt: string;
}

export interface MessageContext {
  type: "listing" | "request" | "transaction";
  id: string;
  title?: string;
}

export interface MessageDto {
  messageId: string;
  senderId: string;
  recipientId: string;
  content: string;
  context?: MessageContext | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface ConversationDto {
  user: UserSummary;
  lastMessage: {
    messageId: string;
    content: string;
    senderId: string;
    createdAt: string;
    isRead: boolean;
  };
  unreadCount: number;
}

export interface TransactionPaymentDto {
  method: PaymentMethod;
  status: "recorded";
  notes?: string | null;
}

export interface TransactionObject {
  transactionId: string;
  listingId: string | null;
  requestId: string | null;
  title: string;
  transactionType: ListingType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  quantity: number;
  rentalStartDate: string | null;
  rentalEndDate: string | null;
  buyer: UserSummary;
  seller: UserSummary;
  payment: TransactionPaymentDto;
  buyerConfirmed: boolean;
  sellerConfirmed: boolean;
  buyerConfirmedAt: string | null;
  sellerConfirmedAt: string | null;
  cancelReason: string | null;
  cancelledBy: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  expiresAt: string;
}

export interface RatingReviewerSummary {
  userId: string;
  firstName: string;
  avatarUrl: string | null;
}

export interface RatingDto {
  ratingId: string;
  transactionId: string;
  revieweeId: string;
  rating: number;
  comment: string | null;
  reviewer: RatingReviewerSummary;
  createdAt: string;
}

export interface RatingDistribution {
  "1": number;
  "2": number;
  "3": number;
  "4": number;
  "5": number;
}

export interface UserRatingsResponse {
  averageRating: number;
  totalRatings: number;
  distribution: RatingDistribution;
  reviews: RatingDto[];
}

export interface ReportDto {
  reportId: string;
  reporter?: UserSummary;
  reportType: ReportType;
  targetId: string;
  targetPreview?: Record<string, unknown>;
  category: ReportCategory;
  description: string;
  status: ReportStatus;
  reportCountOnTarget?: number;
  createdAt: string;
}

export interface NotificationDto {
  notificationId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface VerificationDto {
  verificationId: string;
  user?: UserSummary;
  type: "student_id" | "national_id";
  studentId?: string | null;
  nationalId?: string | null;
  universityCode?: string | null;
  documentUrl?: string | null;
  status: VerificationStatus;
  rejectionReason?: string | null;
  submittedAt: string;
  verifiedAt?: string | null;
  expiresAt?: string | null;
}

export interface AdminStatsDto {
  pendingVerifications: number;
  openReports: number;
  totalUsers: number;
  activeListings: number;
  completedDeals: number;
}

export interface AdminUserDto extends UserProfileDto {
  warningCount: number;
  suspensionUntil: string | null;
  isActive: boolean;
}
