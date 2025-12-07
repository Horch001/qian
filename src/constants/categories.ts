import {
  ShoppingCart, Monitor, Wrench, Users, BookOpen, Eye,
  MessageCircle, Gamepad2, Gavel, ShieldCheck, Link as LinkIcon, Trophy
} from 'lucide-react';
import { CategoryItem } from '../types';

export const CATEGORIES: CategoryItem[] = [
  // 第1行：核心商城（最高频）
  {
    id: '1',
    title: { zh: '实物商城', en: 'Product Mall', ko: '상품 쇼핑몰', vi: 'Mua sắm hàng hóa' },
    description: { zh: '生活日用、数码外设、居家好物应有尽有。', en: 'Daily essentials, digital peripherals, and home goods all available.', ko: '생활용품, 디지털 주변기기, 가정용품 등 모두 준비되어 있습니다.', vi: 'Nhu yếu phẩm hàng ngày, phần cứng kỹ thuật số, hàng gia dụng đều có sẵn.' },
    icon: ShoppingCart,
    iconColor: 'text-yellow-400',
  },
  {
    id: '2',
    title: { zh: '虚拟商城', en: 'Virtual Mall', ko: '가상 쇼핑몰', vi: 'Cửa hàng ảo' },
    description: { zh: '游戏点卡、会员订阅、课程资料等虚拟商品。', en: 'Game cards, membership subscriptions, course materials and other virtual goods.', ko: '게임 카드, 멤버십 구독, 과정 자료 등의 가상 상품.', vi: 'Thẻ trò chơi, đăng ký thành viên, tài liệu khóa học và các hàng hóa ảo khác.' },
    icon: Monitor,
    iconColor: 'text-yellow-400',
  },
  {
    id: '5',
    title: { zh: '知识付费', en: 'Paid Courses', ko: '유료 강좌', vi: 'Khóa học trả phí' },
    description: { zh: '精选视频课程与训练营，系统提升技能。', en: 'Curated video courses and training camps to systematically improve skills.', ko: '엄선된 비디오 과정 및 훈련 캠프로 체계적으로 기술을 향상시킵니다.', vi: 'Các khóa học video được chọn lọc và trại huấn luyện để nâng cao kỹ năng một cách có hệ thống.' },
    icon: BookOpen,
    iconColor: 'text-yellow-400',
  },
  // 第2行：服务类（中频）
  {
    id: '3',
    title: { zh: '上门服务', en: 'Door-to-Door Service', ko: '현장 서비스', vi: 'Dịch vụ tại nhà' },
    description: { zh: '预约保洁、维修、搬运、跑腿等服务。', en: 'Book cleaning, repair, moving, and errand services.', ko: '청소, 수리, 이사, 심부름 등의 서비스 예약.', vi: 'Đặt dịch vụ vệ sinh, sửa chữa, chuyển nhà và giúp việc.' },
    icon: Wrench,
    iconColor: 'text-yellow-400',
  },
  {
    id: '4',
    title: { zh: '线下陪玩', en: 'Offline Playmate', ko: '오프라인 플레이메이트', vi: 'Bạn chơi ngoại tuyến' },
    description: { zh: '附近陪玩与陪练，真实线下互动与服务。', en: 'Local playmates and coaching with real offline interaction.', ko: '근처 플레이메이트 및 코칭으로 실제 오프라인 상호작용.', vi: 'Bạn chơi địa phương và huấn luyện với tương tác ngoại tuyến thực tế.' },
    icon: Users,
    iconColor: 'text-yellow-400',
  },
  {
    id: '6',
    title: { zh: '商业调查', en: 'Business Investigation', ko: '비즈니스 조사', vi: 'Điều tra kinh doanh' },
    description: { zh: '提供背景调查、市场调研与尽职调查服务。', en: 'Provide background checks, market research, and due diligence services.', ko: '배경 조사, 시장 조사 및 실사 서비스 제공.', vi: 'Cung cấp dịch vụ kiểm tra lý lịch, nghiên cứu thị trường và thẩm định.' },
    icon: Eye,
    iconColor: 'text-yellow-400',
  },
  // 第3行：商业交易类（重要但低频）
  {
    id: '8',
    title: { zh: '拍卖平台', en: 'Auction Platform', ko: '경매 플랫폼', vi: 'Nền tảng đấu giá' },
    description: { zh: '竞拍虚拟权益与稀缺资源，价高者得。', en: 'Bid for virtual rights and scarce resources, highest bidder wins.', ko: '가상 권리와 희귀 자원을 입찰하고 최고 입찰자가 승리합니다.', vi: 'Đấu giá quyền ảo và tài nguyên khan hiếm, người trả giá cao nhất thắng.' },
    icon: Gavel,
    iconColor: 'text-yellow-400',
  },
  {
    id: '9',
    title: { zh: '担保交易', en: 'Secured Transaction', ko: '담보 거래', vi: 'Giao dịch được bảo vệ' },
    description: { zh: '平台担保与纠纷处理，安心买卖更可靠。', en: 'Platform guarantee and dispute resolution for safer and more reliable trading.', ko: '더 안전하고 신뢰할 수 있는 거래를 위한 플랫폼 보증 및 분쟁 해결.', vi: 'Bảo đảm nền tảng và giải quyết tranh chấp để giao dịch an toàn và đáng tin cậy hơn.' },
    icon: ShieldCheck,
    iconColor: 'text-yellow-400',
  },
  // 第4行：社区辅助功能
  {
    id: '10',
    title: { zh: '悬赏大厅', en: 'Bounty Hall', ko: '현상금 홀', vi: 'Sảnh truy nã' },
    description: { zh: '发布悬赏任务，快速找到资源与帮手。', en: 'Post bounty tasks to quickly find resources and helpers.', ko: '현상금 작업을 게시하여 리소스와 도우미를 빠르게 찾습니다.', vi: 'Đăng nhiệm vụ truy nã để nhanh chóng tìm tài nguyên và người giúp đỡ.' },
    icon: Trophy,
    iconColor: 'text-yellow-400',
  },
  {
    id: '7',
    title: { zh: '私密树洞', en: 'Secret Tree Hole', ko: '비밀의 나무 구멍', vi: 'Hố cây bí mật' },
    description: { zh: '匿名倾诉心事，树洞守护你的隐私安全。', en: 'Anonymously share your thoughts, tree hole protects your privacy.', ko: '익명으로 생각을 공유하고 나무 구멍이 당신의 개인정보를 보호합니다.', vi: 'Chia sẻ suy nghĩ ẩn danh, cây lỗ bảo vệ quyền riêng tư của bạn.' },
    icon: MessageCircle,
    iconColor: 'text-yellow-400',
  },
  {
    id: '11',
    title: { zh: '休闲游戏', en: 'Casual Games', ko: '캐주얼 게임', vi: 'Trò chơi giải trí' },
    description: { zh: '斗地主、炸金花、消消乐等休闲小游戏。', en: 'Casual games like Dou Dizhu, Zhajinhua, Match 3 and more.', ko: '투디주, 자진화, 매치 3 등의 캐주얼 게임.', vi: 'Các trò chơi giải trí như Đấu Địa Chủ, Zhajinhua, Match 3 và nhiều hơn nữa.' },
    icon: Gamepad2,
    iconColor: 'text-yellow-400',
  },
  {
    id: '12',
    title: { zh: '友情链接', en: 'Friendly Links', ko: '우호적인 링크', vi: 'Liên kết thân thiện' },
    description: { zh: '合作站点与资源导航，互联共享共赢。', en: 'Partner sites and resource navigation for mutual sharing and win-win.', ko: '상호 공유 및 윈-윈을 위한 파트너 사이트 및 리소스 네비게이션.', vi: 'Các trang web đối tác và điều hướng tài nguyên để chia sẻ và cùng thắng.' },
    icon: LinkIcon,
    iconColor: 'text-yellow-400',
  },
];
