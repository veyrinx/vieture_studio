// Default website content. On first start the server copies this into data/content.json;
// after that, everything is edited from the admin panel (/admin).
// Text supports a small safe markup — see src/shared/rich.ts.
import type { SiteContent } from './types.ts';

export const defaultContent: SiteContent = {
  "version": 1,
  "migrations": ["nav-blog"],
  "settings": {
    "siteName": "VieTure Studio",
    "email": "vieturegroup@gmail.com",
    "phone": "",
    "zalo": "",
    "address": {
      "vi": "",
      "en": ""
    },
    "floatingContact": true,
    "seo": {
      "title": {
        "vi": "VieTure Studio — Build Ideas. Engineer the Future.",
        "en": "VieTure Studio — Build Ideas. Engineer the Future."
      },
      "description": {
        "vi": "VieTure Studio là studio công nghệ đa lĩnh vực: phát triển phần mềm, an ninh mạng, AI & tự động hóa, Cloud & DevOps, thiết kế số và nghiên cứu phát triển sản phẩm.",
        "en": "VieTure Studio is a multi-disciplinary tech studio: software development, cybersecurity, AI & automation, Cloud & DevOps, digital design and product R&D."
      }
    },
    "nav": [
      {
        "label": {
          "vi": "Về chúng tôi",
          "en": "About"
        },
        "href": "#about"
      },
      {
        "label": {
          "vi": "Lĩnh vực",
          "en": "Services"
        },
        "href": "#services"
      },
      {
        "label": {
          "vi": "Giải pháp",
          "en": "Solutions"
        },
        "href": "#solutions"
      },
      {
        "label": {
          "vi": "Bảo mật",
          "en": "Security"
        },
        "href": "#security"
      },
      {
        "label": {
          "vi": "Dự án",
          "en": "Projects"
        },
        "href": "#projects"
      },
      {
        "label": {
          "vi": "Công nghệ",
          "en": "Tech"
        },
        "href": "#tech"
      },
      {
        "label": {
          "vi": "Blog",
          "en": "Blog"
        },
        "href": "/blog"
      },
      {
        "label": {
          "vi": "FAQ",
          "en": "FAQ"
        },
        "href": "#faq"
      }
    ],
    "footerLinks": [
      {
        "label": {
          "vi": "Về chúng tôi",
          "en": "About"
        },
        "href": "#about"
      },
      {
        "label": {
          "vi": "Giải pháp",
          "en": "Solutions"
        },
        "href": "#solutions"
      },
      {
        "label": {
          "vi": "Quy trình",
          "en": "Process"
        },
        "href": "#process"
      },
      {
        "label": {
          "vi": "Bảo mật",
          "en": "Security"
        },
        "href": "#security"
      },
      {
        "label": {
          "vi": "Công nghệ",
          "en": "Tech"
        },
        "href": "#tech"
      },
      {
        "label": {
          "vi": "Sứ mệnh & Tầm nhìn",
          "en": "Mission & Vision"
        },
        "href": "#mission"
      },
      {
        "label": {
          "vi": "Giá trị",
          "en": "Values"
        },
        "href": "#values"
      },
      {
        "label": {
          "vi": "FAQ",
          "en": "FAQ"
        },
        "href": "#faq"
      }
    ],
    "social": [],
    "extraContacts": []
  },
  "sections": [
    {
      "id": "marquee",
      "enabled": true
    },
    {
      "id": "about",
      "enabled": true
    },
    {
      "id": "audience",
      "enabled": true
    },
    {
      "id": "services",
      "enabled": true
    },
    {
      "id": "solutions",
      "enabled": true
    },
    {
      "id": "security",
      "enabled": true
    },
    {
      "id": "band",
      "enabled": true
    },
    {
      "id": "why",
      "enabled": true
    },
    {
      "id": "process",
      "enabled": true
    },
    {
      "id": "projects",
      "enabled": true
    },
    {
      "id": "tech",
      "enabled": true
    },
    {
      "id": "engage",
      "enabled": true
    },
    {
      "id": "mission",
      "enabled": true
    },
    {
      "id": "values",
      "enabled": true
    },
    {
      "id": "direction",
      "enabled": true
    },
    {
      "id": "faq",
      "enabled": true
    },
    {
      "id": "news",
      "enabled": true
    },
    {
      "id": "careers",
      "enabled": true
    },
    {
      "id": "contact",
      "enabled": true
    }
  ],
  "text": {
    "nav.contact": {
      "vi": "Liên hệ ngay",
      "en": "Contact us"
    },
    "nav.menu": {
      "vi": "Mở menu",
      "en": "Open menu"
    },
    "hero.badge": {
      "vi": "Multi-disciplinary Tech Studio",
      "en": "Multi-disciplinary Tech Studio"
    },
    "hero.lead": {
      "vi": "Biến ý tưởng thành công nghệ, kiến tạo tương lai số. Chúng tôi nghiên cứu, thiết kế, phát triển và triển khai phần mềm, nền tảng số và giải pháp công nghệ có tính ứng dụng cao.",
      "en": "Turning ideas into technology, shaping the digital future. We research, design, develop and deploy software, digital platforms and highly practical technology solutions."
    },
    "hero.cta1": {
      "vi": "Bắt đầu dự án",
      "en": "Start a project"
    },
    "hero.cta2": {
      "vi": "Khám phá lĩnh vực",
      "en": "Explore services"
    },
    "hero.f1t": {
      "vi": "Security-first",
      "en": "Security-first"
    },
    "hero.f1d": {
      "vi": "Bảo mật từ thiết kế",
      "en": "Secure by design"
    },
    "hero.f2t": {
      "vi": "AI & Automation",
      "en": "AI & Automation"
    },
    "hero.f2d": {
      "vi": "Tự động hóa quy trình",
      "en": "Workflow automation"
    },
    "hero.f3t": {
      "vi": "Cloud & DevOps",
      "en": "Cloud & DevOps"
    },
    "hero.f3d": {
      "vi": "Docker · Linux · CI/CD",
      "en": "Docker · Linux · CI/CD"
    },
    "hero.scroll": {
      "vi": "Cuộn xuống",
      "en": "Scroll down"
    },
    "about.eyebrow": {
      "vi": "Về chúng tôi",
      "en": "About us"
    },
    "about.title": {
      "vi": "Studio công nghệ [đa lĩnh vực]",
      "en": "A [multi-disciplinary] tech studio"
    },
    "about.p1": {
      "vi": "[VieTure Studio] tập trung vào nghiên cứu, thiết kế, phát triển và triển khai các sản phẩm phần mềm, nền tảng số và giải pháp công nghệ.",
      "en": "[VieTure Studio] focuses on researching, designing, developing and deploying software products, digital platforms and technology solutions."
    },
    "about.p2": {
      "vi": "Chúng tôi hướng đến việc biến những ý tưởng thành sản phẩm thực tế, kết hợp tư duy sáng tạo, năng lực kỹ thuật và tinh thần đổi mới để tạo ra các giải pháp có tính ứng dụng cao.",
      "en": "We turn ideas into real products — combining creative thinking, engineering capability and a spirit of innovation to build solutions with real-world impact."
    },
    "sec.eyebrow": {
      "vi": "Tư vấn & dịch vụ bảo mật",
      "en": "Security consulting & services"
    },
    "sec.title": {
      "vi": "Tìm ra lỗ hổng [trước kẻ tấn công]",
      "en": "Find the vulnerabilities [before attackers do]"
    },
    "sec.desc": {
      "vi": "Đánh giá, kiểm thử và gia cố hệ thống một cách chủ động — để website, ứng dụng và dữ liệu của bạn luôn an toàn.",
      "en": "Proactively assess, test and harden your systems — so your websites, applications and data stay safe."
    },
    "sec.principles": {
      "vi": "Nguyên tắc làm việc",
      "en": "How we work"
    },
    "sec.process": {
      "vi": "Quy trình đánh giá bảo mật",
      "en": "Security assessment process"
    },
    "sec.report": {
      "vi": "Báo cáo bàn giao gồm",
      "en": "The delivered report includes"
    },
    "sec.severity": {
      "vi": "Lỗ hổng được xếp theo mức độ rủi ro",
      "en": "Findings are ranked by risk level"
    },
    "sec.cta": {
      "vi": "Yêu cầu đánh giá bảo mật",
      "en": "Request a security assessment"
    },
    "sec.note": {
      "vi": "Chỉ thực hiện trên hệ thống bạn sở hữu hoặc được ủy quyền hợp pháp.",
      "en": "Only performed on systems you own or are legally authorized to test."
    },
    "stat.1": {
      "vi": "Lĩnh vực công nghệ",
      "en": "Technology fields"
    },
    "stat.2": {
      "vi": "Giá trị cốt lõi",
      "en": "Core values"
    },
    "stat.3": {
      "vi": "Từ ý tưởng đến vận hành",
      "en": "From idea to operation"
    },
    "stat.4": {
      "vi": "Hệ sinh thái VieTure",
      "en": "VieTure ecosystem"
    },
    "services.eyebrow": {
      "vi": "Lĩnh vực hoạt động",
      "en": "What we do"
    },
    "services.title": {
      "vi": "Từ ý tưởng đến [hạ tầng vận hành]",
      "en": "From idea to [production infrastructure]"
    },
    "services.desc": {
      "vi": "Một đội ngũ, đầy đủ năng lực: phần mềm, bảo mật, AI, hạ tầng và thiết kế — phối hợp trong cùng một quy trình.",
      "en": "One team, full capability: software, security, AI, infrastructure and design — working together in a single process."
    },
    "process.eyebrow": {
      "vi": "Quy trình",
      "en": "Process"
    },
    "process.title": {
      "vi": "Biến ý tưởng thành [sản phẩm thật]",
      "en": "Turning ideas into [real products]"
    },
    "process.desc": {
      "vi": "Quy trình rõ ràng, minh bạch ở từng bước — để sản phẩm ra đời đúng hướng, an toàn và sẵn sàng mở rộng.",
      "en": "A clear, transparent process at every step — so products ship in the right direction, secure and ready to scale."
    },
    "projects.eyebrow": {
      "vi": "Dự án & sản phẩm",
      "en": "Projects & products"
    },
    "projects.title": {
      "vi": "Những gì chúng tôi [đã xây dựng]",
      "en": "What we [have built]"
    },
    "projects.desc": {
      "vi": "Một số sản phẩm và dự án tiêu biểu của VieTure Studio.",
      "en": "Selected products and projects by VieTure Studio."
    },
    "projects.view": {
      "vi": "Xem chi tiết",
      "en": "View details"
    },
    "audience.eyebrow": {
      "vi": "Chúng tôi phục vụ ai",
      "en": "Who we serve"
    },
    "audience.title": {
      "vi": "Giải pháp cho [mọi quy mô]",
      "en": "Solutions for [every scale]"
    },
    "audience.desc": {
      "vi": "Dù bạn là một cá nhân có ý tưởng, một doanh nghiệp cần chuyển đổi số hay một tổ chức phục vụ cộng đồng — chúng tôi đều có cách tiếp cận phù hợp.",
      "en": "Whether you are an individual with an idea, a business going digital or an organization serving a community — we have the right approach."
    },
    "solutions.eyebrow": {
      "vi": "Giải pháp chi tiết",
      "en": "Solutions in detail"
    },
    "solutions.title": {
      "vi": "Chúng tôi [làm được gì] cho bạn",
      "en": "What we [can build] for you"
    },
    "solutions.desc": {
      "vi": "Chọn một lĩnh vực để xem các hạng mục cụ thể và công nghệ thường dùng.",
      "en": "Pick an area to see concrete deliverables and the technologies we typically use."
    },
    "solutions.deliver": {
      "vi": "Hạng mục tiêu biểu",
      "en": "Typical deliverables"
    },
    "solutions.stack": {
      "vi": "Công nghệ thường dùng",
      "en": "Common stack"
    },
    "solutions.cta": {
      "vi": "Trao đổi về lĩnh vực này",
      "en": "Discuss this area"
    },
    "band.title": {
      "vi": "Chưa chắc mình cần giải pháp nào?",
      "en": "Not sure which solution you need?"
    },
    "band.desc": {
      "vi": "Mô tả vấn đề bạn đang gặp — chúng tôi sẽ cùng phân tích và đề xuất hướng đi phù hợp.",
      "en": "Describe the problem you are facing — we will analyze it with you and suggest the right direction."
    },
    "band.cta": {
      "vi": "Nhận tư vấn",
      "en": "Get advice"
    },
    "why.eyebrow": {
      "vi": "Vì sao chọn VieTure",
      "en": "Why VieTure"
    },
    "why.title": {
      "vi": "Đối tác công nghệ [đáng tin cậy]",
      "en": "A technology partner [you can trust]"
    },
    "why.desc": {
      "vi": "Cách chúng tôi làm việc được xây dựng trên năm giá trị cốt lõi: Innovation, Engineering, Security, Quality, Sustainability.",
      "en": "The way we work is built on five core values: Innovation, Engineering, Security, Quality, Sustainability."
    },
    "tech.eyebrow": {
      "vi": "Công nghệ",
      "en": "Technology"
    },
    "tech.title": {
      "vi": "Bộ công cụ [hiện đại], đã được kiểm chứng",
      "en": "A [modern], proven toolkit"
    },
    "tech.desc": {
      "vi": "Chúng tôi chọn công nghệ theo bài toán — ưu tiên giải pháp ổn định, phổ biến, dễ bảo trì và dễ mở rộng.",
      "en": "We choose technology to fit the problem — favoring stable, widely used tools that are easy to maintain and scale."
    },
    "engage.eyebrow": {
      "vi": "Hình thức hợp tác",
      "en": "Engagement models"
    },
    "engage.title": {
      "vi": "Linh hoạt theo [nhu cầu của bạn]",
      "en": "Flexible to [your needs]"
    },
    "engage.desc": {
      "vi": "Ba cách hợp tác phổ biến — có thể kết hợp tùy giai đoạn của dự án.",
      "en": "Three common ways to work together — combine them as your project evolves."
    },
    "engage.best": {
      "vi": "Phù hợp khi",
      "en": "Best for"
    },
    "engage.cta": {
      "vi": "Trao đổi ngay",
      "en": "Let’s talk"
    },
    "faq.eyebrow": {
      "vi": "Câu hỏi thường gặp",
      "en": "FAQ"
    },
    "faq.title": {
      "vi": "Bạn hỏi, [chúng tôi trả lời]",
      "en": "You ask, [we answer]"
    },
    "faq.desc": {
      "vi": "Chưa thấy câu trả lời bạn cần? Gửi câu hỏi qua form liên hệ bên dưới.",
      "en": "Can’t find what you need? Send us your question through the contact form below."
    },
    "mission.eyebrow": {
      "vi": "Sứ mệnh",
      "en": "Mission"
    },
    "mission.title": {
      "vi": "Ứng dụng công nghệ để giải quyết các vấn đề thực tế",
      "en": "Applying technology to solve real-world problems"
    },
    "mission.desc": {
      "vi": "Tối ưu quy trình làm việc và tạo ra những sản phẩm hữu ích cho cá nhân, doanh nghiệp và cộng đồng.",
      "en": "Optimizing the way people work and creating useful products for individuals, businesses and communities."
    },
    "vision.eyebrow": {
      "vi": "Tầm nhìn",
      "en": "Vision"
    },
    "vision.title": {
      "vi": "Xây dựng hệ sinh thái công nghệ mang thương hiệu VieTure",
      "en": "Building a technology ecosystem under the VieTure brand"
    },
    "vision.desc": {
      "vi": "Trở thành một studio công nghệ đa lĩnh vực, không ngừng đổi mới, phát triển các sản phẩm có giá trị và từng bước mở rộng hệ sinh thái.",
      "en": "To become a multi-disciplinary tech studio that keeps innovating, builds valuable products and steadily grows its ecosystem."
    },
    "values.eyebrow": {
      "vi": "Giá trị cốt lõi",
      "en": "Core values"
    },
    "values.title": {
      "vi": "Năm nguyên tắc [chúng tôi theo đuổi]",
      "en": "Five principles [we live by]"
    },
    "direction.eyebrow": {
      "vi": "Định hướng phát triển",
      "en": "Direction"
    },
    "direction.quote": {
      "vi": "Kết hợp [dịch vụ công nghệ] với [nghiên cứu & phát triển sản phẩm riêng], tạo nền tảng cho một hệ sinh thái số linh hoạt, hiện đại và có khả năng mở rộng.",
      "en": "Combining [technology services] with [in-house product R&D] to lay the foundation for a flexible, modern and scalable digital ecosystem."
    },
    "contact.eyebrow": {
      "vi": "Liên hệ",
      "en": "Contact"
    },
    "contact.title": {
      "vi": "Có ý tưởng?\nHãy cùng biến nó thành sản phẩm.",
      "en": "Got an idea?\nLet’s turn it into a product."
    },
    "contact.desc": {
      "vi": "Kể cho chúng tôi về dự án của bạn — website, ứng dụng, AI, bảo mật hay hạ tầng. Chúng tôi sẽ phản hồi sớm nhất có thể.",
      "en": "Tell us about your project — website, app, AI, security or infrastructure. We’ll get back to you as soon as possible."
    },
    "form.name": {
      "vi": "Họ và tên",
      "en": "Full name"
    },
    "form.namePh": {
      "vi": "Nguyễn Văn A",
      "en": "Jane Doe"
    },
    "form.email": {
      "vi": "Email",
      "en": "Email"
    },
    "form.emailPh": {
      "vi": "ban@email.com",
      "en": "you@email.com"
    },
    "form.topic": {
      "vi": "Lĩnh vực quan tâm",
      "en": "Area of interest"
    },
    "form.other": {
      "vi": "Khác",
      "en": "Other"
    },
    "form.message": {
      "vi": "Mô tả dự án",
      "en": "Project description"
    },
    "form.messagePh": {
      "vi": "Ý tưởng, mục tiêu, thời gian dự kiến...",
      "en": "Your idea, goals, expected timeline..."
    },
    "form.submit": {
      "vi": "Gửi yêu cầu",
      "en": "Send request"
    },
    "form.sending": {
      "vi": "Đang gửi...",
      "en": "Sending..."
    },
    "form.note": {
      "vi": "Thông tin của bạn chỉ được dùng để liên hệ về dự án.",
      "en": "Your information is only used to get in touch about your project."
    },
    "form.consent": {
      "vi": "Tôi đồng ý để VieTure Studio xử lý thông tin trên nhằm phản hồi yêu cầu, theo [Chính sách bảo mật](/privacy).",
      "en": "I agree that VieTure Studio may process this information to respond to my request, as described in the [Privacy Policy](/privacy?lang=en)."
    },
    "form.needConsent": {
      "vi": "Vui lòng tích vào ô đồng ý với Chính sách bảo mật trước khi gửi.",
      "en": "Please tick the box to accept the Privacy Policy before sending."
    },
    "footer.privacy": {
      "vi": "Chính sách bảo mật",
      "en": "Privacy Policy"
    },
    "form.ok": {
      "vi": "✓ Đã gửi! Chúng tôi sẽ liên hệ lại với bạn sớm.",
      "en": "✓ Sent! We’ll get back to you shortly."
    },
    "form.invalid": {
      "vi": "Vui lòng nhập họ tên, email hợp lệ và mô tả tối thiểu 10 ký tự.",
      "en": "Please enter your name, a valid email and at least 10 characters of description."
    },
    "form.limited": {
      "vi": "Bạn đã gửi quá nhiều lần. Vui lòng thử lại sau ít phút.",
      "en": "Too many requests. Please try again in a few minutes."
    },
    "form.fallback": {
      "vi": "Không kết nối được máy chủ — đang mở ứng dụng email của bạn để gửi thay.",
      "en": "Could not reach the server — opening your email app instead."
    },
    "form.mailSubject": {
      "vi": "Yêu cầu dự án",
      "en": "Project request"
    },
    "footer.services": {
      "vi": "Lĩnh vực",
      "en": "Services"
    },
    "footer.company": {
      "vi": "Công ty",
      "en": "Company"
    },
    "footer.contact": {
      "vi": "Liên hệ",
      "en": "Contact"
    },
    "footer.request": {
      "vi": "Gửi yêu cầu dự án",
      "en": "Send a project request"
    },
    "footer.tagline": {
      "vi": "Build Ideas. Engineer the Future.\nBiến ý tưởng thành công nghệ, kiến tạo tương lai số.",
      "en": "Build Ideas. Engineer the Future.\nTurning ideas into technology, shaping the digital future."
    },
    "footer.rights": {
      "vi": "All rights reserved.",
      "en": "All rights reserved."
    },
    "totop": {
      "vi": "Về đầu trang",
      "en": "Back to top"
    },
    "news.eyebrow": {
      "vi": "Tin tức & Blog",
      "en": "News & Blog"
    },
    "news.title": {
      "vi": "Kiến thức & [cập nhật mới]",
      "en": "Insights & [latest news]"
    },
    "news.desc": {
      "vi": "Chia sẻ kinh nghiệm về phần mềm, bảo mật, AI và hạ tầng từ đội ngũ VieTure.",
      "en": "Notes on software, security, AI and infrastructure from the VieTure team."
    },
    "news.all": {
      "vi": "Xem tất cả bài viết",
      "en": "View all articles"
    },
    "news.read": {
      "vi": "phút đọc",
      "en": "min read"
    },
    "careers.eyebrow": {
      "vi": "Tuyển dụng",
      "en": "Careers"
    },
    "careers.title": {
      "vi": "Cùng chúng tôi [kiến tạo tương lai số]",
      "en": "Help us [engineer the future]"
    },
    "careers.desc": {
      "vi": "Chúng tôi tìm kiếm những người yêu công nghệ, thích học hỏi và muốn tạo ra sản phẩm có giá trị thật.",
      "en": "We are looking for people who love technology, keep learning and want to build products with real value."
    },
    "careers.empty": {
      "vi": "Hiện chưa có vị trí nào đang mở. Bạn vẫn có thể gửi CV — chúng tôi sẽ liên hệ khi có vị trí phù hợp.",
      "en": "There are no open positions right now. You can still send us your CV — we will reach out when a suitable role opens."
    },
    "careers.generalOpen": {
      "vi": "Không thấy vị trí phù hợp? Gửi CV cho chúng tôi — chúng tôi sẽ liên hệ khi có cơ hội phù hợp với bạn.",
      "en": "Don't see a matching role? Send us your CV — we'll reach out when a suitable opportunity opens."
    },
    "careers.general": {
      "vi": "Gửi CV tự do",
      "en": "Send an open application"
    },
    "careers.generalTitle": {
      "vi": "Ứng tuyển tự do",
      "en": "Open application"
    },
    "careers.details": {
      "vi": "Xem chi tiết & ứng tuyển",
      "en": "Details & apply"
    },
    "careers.deadline": {
      "vi": "Hạn nộp",
      "en": "Apply by"
    },
    "careers.salary": {
      "vi": "Mức lương",
      "en": "Salary"
    },
    "careers.description": {
      "vi": "Mô tả công việc",
      "en": "Job description"
    },
    "careers.requirements": {
      "vi": "Yêu cầu",
      "en": "Requirements"
    },
    "careers.benefits": {
      "vi": "Quyền lợi",
      "en": "Benefits"
    },
    "careers.applyTitle": {
      "vi": "Ứng tuyển vị trí này",
      "en": "Apply for this role"
    },
    "careers.close": {
      "vi": "Đóng",
      "en": "Close"
    },
    "apply.name": {
      "vi": "Họ và tên",
      "en": "Full name"
    },
    "apply.email": {
      "vi": "Email",
      "en": "Email"
    },
    "apply.phone": {
      "vi": "Số điện thoại",
      "en": "Phone number"
    },
    "apply.cv": {
      "vi": "CV (PDF, tối đa 5MB)",
      "en": "CV (PDF, max 5MB)"
    },
    "apply.cvLink": {
      "vi": "Hoặc link CV / LinkedIn / Portfolio",
      "en": "Or a link to your CV / LinkedIn / portfolio"
    },
    "apply.message": {
      "vi": "Giới thiệu ngắn về bạn",
      "en": "A short introduction"
    },
    "apply.consent": {
      "vi": "Tôi đồng ý để VieTure Studio lưu và xử lý hồ sơ này cho mục đích tuyển dụng, theo [Chính sách bảo mật](/privacy).",
      "en": "I agree that VieTure Studio may store and process this application for recruitment, as described in the [Privacy Policy](/privacy?lang=en)."
    },
    "apply.submit": {
      "vi": "Nộp hồ sơ",
      "en": "Submit application"
    },
    "apply.sending": {
      "vi": "Đang gửi...",
      "en": "Sending..."
    },
    "apply.ok": {
      "vi": "✓ Đã nhận hồ sơ! Chúng tôi sẽ liên hệ với bạn nếu hồ sơ phù hợp.",
      "en": "✓ Application received! We will contact you if your profile is a good fit."
    },
    "apply.invalid": {
      "vi": "Vui lòng điền đầy đủ các ô bắt buộc (*) và kiểm tra lại email, số điện thoại.",
      "en": "Please fill in all required fields (*) and check your email and phone number."
    },
    "apply.needConsent": {
      "vi": "Vui lòng tích vào ô đồng ý trước khi nộp.",
      "en": "Please tick the consent box before submitting."
    },
    "apply.fileTooBig": {
      "vi": "File CV tối đa 5MB.",
      "en": "The CV file must be 5MB or smaller."
    },
    "apply.fileType": {
      "vi": "CV phải là file PDF.",
      "en": "The CV must be a PDF file."
    },
    "apply.limited": {
      "vi": "Bạn đã nộp quá nhiều lần. Vui lòng thử lại sau.",
      "en": "Too many submissions. Please try again later."
    },
    "apply.error": {
      "vi": "Không gửi được hồ sơ. Vui lòng thử lại hoặc gửi CV qua email.",
      "en": "Could not send your application. Please try again or email us your CV."
    }
  },
  "heroTags": [
    "Software",
    "Security",
    "AI",
    "Cloud",
    "Design"
  ],
  "stats": [
    {
      "value": "8",
      "label": {
        "vi": "Lĩnh vực công nghệ",
        "en": "Technology fields"
      }
    },
    {
      "value": "5",
      "label": {
        "vi": "Giá trị cốt lõi",
        "en": "Core values"
      }
    },
    {
      "value": "360°",
      "label": {
        "vi": "Từ ý tưởng đến vận hành",
        "en": "From idea to operation"
      }
    },
    {
      "value": "1",
      "label": {
        "vi": "Hệ sinh thái VieTure",
        "en": "VieTure ecosystem"
      }
    }
  ],
  "terminal": {
    "vi": [
      "$ npx vieture init --idea \"your-product\"",
      "",
      "  ✔ research      phân tích bài toán",
      "  ✔ design        UI/UX & kiến trúc",
      "  ✔ develop       web · mobile · api",
      "  ✔ secure        audit & pentest",
      "  ✔ deploy        docker · linux · ci/cd",
      "",
      "→ Build Ideas. Engineer the Future."
    ],
    "en": [
      "$ npx vieture init --idea \"your-product\"",
      "",
      "  ✔ research      define the problem",
      "  ✔ design        UI/UX & architecture",
      "  ✔ develop       web · mobile · api",
      "  ✔ secure        audit & pentest",
      "  ✔ deploy        docker · linux · ci/cd",
      "",
      "→ Build Ideas. Engineer the Future."
    ]
  },
  "marquee": [
    "Node.js",
    "TypeScript",
    "React",
    "Next.js",
    "Vue",
    "Vite",
    "Express",
    "Python",
    "Go",
    "PostgreSQL",
    "MongoDB",
    "Redis",
    "Docker",
    "Kubernetes",
    "Linux",
    "Nginx",
    "GitHub Actions",
    "Cloudflare",
    "AI / LLM",
    "Figma"
  ],
  "services": [
    {
      "id": "software",
      "icon": "monitor-code",
      "title": {
        "vi": "Phát triển phần mềm",
        "en": "Software development"
      },
      "desc": {
        "vi": "Website, web app, ứng dụng desktop, ứng dụng di động và phần mềm quản lý doanh nghiệp.",
        "en": "Websites, web apps, desktop apps, mobile apps and business management software."
      },
      "tags": [
        "Web",
        "Mobile",
        "Desktop",
        "ERP"
      ],
      "items": {
        "vi": [
          "Landing page & website doanh nghiệp chuẩn SEO",
          "Web app, hệ thống SaaS nhiều người dùng",
          "Ứng dụng di động iOS & Android",
          "Ứng dụng desktop cho Windows, macOS, Linux",
          "Phần mềm quản lý: CRM, ERP, bán hàng, kho, nhân sự",
          "Website thương mại điện tử, tích hợp thanh toán"
        ],
        "en": [
          "SEO-ready landing pages & corporate websites",
          "Web apps and multi-tenant SaaS systems",
          "iOS & Android mobile apps",
          "Desktop apps for Windows, macOS, Linux",
          "Management software: CRM, ERP, sales, inventory, HR",
          "E-commerce websites with payment integration"
        ]
      },
      "stack": [
        "React",
        "Next.js",
        "Vue",
        "React Native",
        "Flutter",
        "Electron"
      ]
    },
    {
      "id": "engineering",
      "icon": "code-slash",
      "title": {
        "vi": "Công nghệ & lập trình",
        "en": "Engineering & programming"
      },
      "desc": {
        "vi": "Backend, frontend, API, cơ sở dữ liệu và tích hợp hệ thống.",
        "en": "Backend, frontend, APIs, databases and system integration."
      },
      "tags": [
        "Node.js",
        "API",
        "Database"
      ],
      "items": {
        "vi": [
          "Thiết kế & xây dựng RESTful / GraphQL API",
          "Thiết kế cơ sở dữ liệu, tối ưu truy vấn và hiệu năng",
          "Tích hợp thanh toán, đăng nhập, bản đồ và dịch vụ bên thứ ba",
          "Nâng cấp, chuyển đổi hệ thống cũ sang công nghệ mới",
          "Kiến trúc module hóa, sẵn sàng mở rộng",
          "Rà soát và tái cấu trúc mã nguồn"
        ],
        "en": [
          "Design & build RESTful / GraphQL APIs",
          "Database design, query and performance tuning",
          "Payment, authentication, maps and third-party integrations",
          "Upgrading and migrating legacy systems",
          "Modular, scale-ready architecture",
          "Code review and refactoring"
        ]
      },
      "stack": [
        "Node.js",
        "TypeScript",
        "Express",
        "Python",
        "Go",
        "PostgreSQL"
      ]
    },
    {
      "id": "security",
      "icon": "shield-lock",
      "title": {
        "vi": "An ninh mạng",
        "en": "Cybersecurity"
      },
      "desc": {
        "vi": "Đánh giá bảo mật, kiểm thử an toàn ứng dụng và tư vấn bảo vệ hệ thống.",
        "en": "Security assessments, application security testing and system protection consulting."
      },
      "tags": [
        "Audit",
        "Pentest",
        "Hardening"
      ],
      "items": {
        "vi": [
          "Đánh giá bảo mật website & ứng dụng theo OWASP Top 10",
          "Kiểm thử xâm nhập (pentest) có ủy quyền",
          "Rà soát cấu hình và gia cố (hardening) máy chủ Linux",
          "Rà soát mã nguồn dưới góc độ bảo mật",
          "Tư vấn phân quyền, sao lưu và ứng phó sự cố",
          "Báo cáo chi tiết kèm khuyến nghị khắc phục"
        ],
        "en": [
          "Website & application security assessment (OWASP Top 10)",
          "Authorized penetration testing",
          "Linux server configuration review & hardening",
          "Security-focused source code review",
          "Access control, backup and incident response advice",
          "Detailed reports with remediation guidance"
        ]
      },
      "stack": [
        "OWASP",
        "Burp Suite",
        "Nmap",
        "Kali Linux",
        "Wireshark"
      ]
    },
    {
      "id": "ai",
      "icon": "bot",
      "title": {
        "vi": "AI & tự động hóa",
        "en": "AI & automation"
      },
      "desc": {
        "vi": "Tích hợp trí tuệ nhân tạo, chatbot, trợ lý thông minh và tự động hóa quy trình.",
        "en": "AI integration, chatbots, smart assistants and workflow automation."
      },
      "tags": [
        "LLM",
        "Chatbot",
        "Automation"
      ],
      "items": {
        "vi": [
          "Chatbot chăm sóc khách hàng cho website, Messenger, Zalo",
          "Trợ lý AI nội bộ trả lời từ tài liệu doanh nghiệp (RAG)",
          "Tự động hóa quy trình: email, báo cáo, nhập liệu",
          "Tích hợp mô hình ngôn ngữ lớn (LLM) vào sản phẩm sẵn có",
          "Trích xuất, phân loại và xử lý dữ liệu từ tài liệu",
          "Dashboard và báo cáo tự động"
        ],
        "en": [
          "Customer-support chatbots for web, Messenger, Zalo",
          "Internal AI assistants grounded in company documents (RAG)",
          "Workflow automation: email, reports, data entry",
          "Integrating large language models into existing products",
          "Document data extraction, classification and processing",
          "Automated dashboards and reports"
        ]
      },
      "stack": [
        "LLM API",
        "RAG",
        "Python",
        "LangChain",
        "n8n"
      ]
    },
    {
      "id": "cloud",
      "icon": "cloud-download",
      "title": {
        "vi": "Cloud & DevOps",
        "en": "Cloud & DevOps"
      },
      "desc": {
        "vi": "Máy chủ, VPS, Linux, Docker, triển khai ứng dụng và vận hành hạ tầng.",
        "en": "Servers, VPS, Linux, Docker, application deployment and infrastructure operations."
      },
      "tags": [
        "Linux",
        "Docker",
        "CI/CD",
        "VPS"
      ],
      "items": {
        "vi": [
          "Thiết lập và quản trị VPS, máy chủ Linux",
          "Đóng gói ứng dụng với Docker",
          "CI/CD: tự động build, kiểm thử và triển khai",
          "Cấu hình Nginx, SSL, tên miền và CDN",
          "Giám sát, ghi log và sao lưu định kỳ",
          "Tối ưu hiệu năng và chi phí hạ tầng"
        ],
        "en": [
          "VPS and Linux server setup & administration",
          "Containerizing applications with Docker",
          "CI/CD: automated build, test and deploy",
          "Nginx, SSL, domain and CDN configuration",
          "Monitoring, logging and scheduled backups",
          "Infrastructure performance and cost optimization"
        ]
      },
      "stack": [
        "Linux",
        "Docker",
        "Nginx",
        "GitHub Actions",
        "Cloudflare"
      ]
    },
    {
      "id": "design",
      "icon": "palette",
      "title": {
        "vi": "Thiết kế số",
        "en": "Digital design"
      },
      "desc": {
        "vi": "UI/UX, thiết kế giao diện, logo và nhận diện thương hiệu.",
        "en": "UI/UX, interface design, logos and brand identity."
      },
      "tags": [
        "UI/UX",
        "Branding",
        "Logo"
      ],
      "items": {
        "vi": [
          "Thiết kế UI/UX cho website và ứng dụng",
          "Wireframe và prototype tương tác",
          "Logo và bộ nhận diện thương hiệu",
          "Xây dựng design system thống nhất",
          "Banner, ấn phẩm và nội dung hình ảnh số",
          "Đánh giá và cải thiện trải nghiệm người dùng"
        ],
        "en": [
          "UI/UX design for websites and apps",
          "Wireframes and interactive prototypes",
          "Logos and brand identity",
          "Consistent design systems",
          "Banners and digital visual assets",
          "User experience review and improvement"
        ]
      },
      "stack": [
        "Figma",
        "Adobe",
        "Design System"
      ]
    },
    {
      "id": "rnd",
      "icon": "flask",
      "title": {
        "vi": "Nghiên cứu & phát triển",
        "en": "Research & development"
      },
      "desc": {
        "vi": "Xây dựng sản phẩm công nghệ, công cụ trực tuyến và nền tảng số.",
        "en": "Building technology products, online tools and digital platforms."
      },
      "tags": [
        "R&D",
        "Tools",
        "Platform"
      ],
      "items": {
        "vi": [
          "Nghiên cứu ý tưởng và xây dựng MVP",
          "Phát triển công cụ trực tuyến",
          "Nền tảng số theo mô hình SaaS",
          "Thử nghiệm công nghệ mới: AI, tự động hóa",
          "Proof of concept (PoC) trước khi đầu tư lớn",
          "Sản phẩm riêng trong hệ sinh thái VieTure"
        ],
        "en": [
          "Idea research and MVP development",
          "Online tools",
          "SaaS digital platforms",
          "Experimenting with new tech: AI, automation",
          "Proofs of concept before major investment",
          "In-house products in the VieTure ecosystem"
        ]
      },
      "stack": [
        "MVP",
        "SaaS",
        "AI",
        "Automation"
      ]
    },
    {
      "id": "consulting",
      "icon": "chat",
      "title": {
        "vi": "Tư vấn công nghệ & chuyển đổi số",
        "en": "Tech consulting & digital transformation"
      },
      "desc": {
        "vi": "Lựa chọn giải pháp, thiết kế kiến trúc và lộ trình chuyển đổi số phù hợp với doanh nghiệp.",
        "en": "Choosing solutions, designing architecture and planning a digital transformation roadmap that fits your business."
      },
      "tags": [
        "Consulting",
        "Architecture",
        "Roadmap"
      ],
      "items": {
        "vi": [
          "Khảo sát hiện trạng và xác định bài toán ưu tiên",
          "Tư vấn lựa chọn công nghệ, nền tảng và nhà cung cấp",
          "Thiết kế kiến trúc hệ thống tổng thể",
          "Lộ trình chuyển đổi số theo từng giai đoạn",
          "Ước tính chi phí, nguồn lực và rủi ro",
          "Đồng hành giám sát triển khai"
        ],
        "en": [
          "Current-state assessment and priority problems",
          "Choosing technologies, platforms and vendors",
          "Overall system architecture design",
          "Phased digital transformation roadmap",
          "Cost, resource and risk estimates",
          "Implementation oversight"
        ]
      },
      "stack": [
        "Architecture",
        "Cloud",
        "Security",
        "AI",
        "Automation"
      ]
    }
  ],
  "audience": [
    {
      "icon": "rocket",
      "title": {
        "vi": "Cá nhân & Startup",
        "en": "Individuals & startups"
      },
      "desc": {
        "vi": "Hiện thực hóa ý tưởng thành sản phẩm đầu tiên: MVP, website, ứng dụng — nhanh, gọn và sẵn sàng phát triển tiếp.",
        "en": "Turn an idea into a first product — an MVP, website or app — fast, lean and ready to grow."
      },
      "points": {
        "vi": [
          "Xây dựng MVP",
          "Website cá nhân, thương hiệu",
          "Tư vấn công nghệ"
        ],
        "en": [
          "MVP development",
          "Personal & brand websites",
          "Tech consulting"
        ]
      }
    },
    {
      "icon": "briefcase",
      "title": {
        "vi": "Doanh nghiệp",
        "en": "Businesses"
      },
      "desc": {
        "vi": "Chuyển đổi số, tối ưu vận hành và bảo vệ hệ thống — từ website, phần mềm quản lý đến tự động hóa và AI.",
        "en": "Digital transformation, leaner operations and protected systems — from websites and management software to automation and AI."
      },
      "points": {
        "vi": [
          "Phần mềm quản lý",
          "Tự động hóa & AI",
          "Bảo mật & hạ tầng"
        ],
        "en": [
          "Management software",
          "Automation & AI",
          "Security & infrastructure"
        ]
      }
    },
    {
      "icon": "users",
      "title": {
        "vi": "Tổ chức & cộng đồng",
        "en": "Organizations & communities"
      },
      "desc": {
        "vi": "Nền tảng số và công cụ trực tuyến giúp kết nối, chia sẻ thông tin và phục vụ cộng đồng hiệu quả hơn.",
        "en": "Digital platforms and online tools that help connect people, share information and serve communities better."
      },
      "points": {
        "vi": [
          "Nền tảng số",
          "Công cụ trực tuyến",
          "Cổng thông tin"
        ],
        "en": [
          "Digital platforms",
          "Online tools",
          "Information portals"
        ]
      }
    }
  ],
  "steps": [
    {
      "title": {
        "vi": "Nghiên cứu",
        "en": "Research"
      },
      "desc": {
        "vi": "Lắng nghe, phân tích nhu cầu và xác định bài toán cốt lõi.",
        "en": "Listen, analyze needs and define the core problem."
      }
    },
    {
      "title": {
        "vi": "Thiết kế",
        "en": "Design"
      },
      "desc": {
        "vi": "Kiến trúc hệ thống, UI/UX và trải nghiệm người dùng.",
        "en": "System architecture, UI/UX and user experience."
      }
    },
    {
      "title": {
        "vi": "Phát triển",
        "en": "Develop"
      },
      "desc": {
        "vi": "Xây dựng sản phẩm với mã nguồn sạch, dễ mở rộng.",
        "en": "Build the product with clean, scalable code."
      }
    },
    {
      "title": {
        "vi": "Kiểm thử & bảo mật",
        "en": "Test & secure"
      },
      "desc": {
        "vi": "Kiểm thử chất lượng và đánh giá an toàn trước khi phát hành.",
        "en": "Quality testing and security review before release."
      }
    },
    {
      "title": {
        "vi": "Triển khai & vận hành",
        "en": "Deploy & operate"
      },
      "desc": {
        "vi": "Đưa sản phẩm lên hạ tầng, giám sát và đồng hành lâu dài.",
        "en": "Ship to infrastructure, monitor and support long-term."
      }
    }
  ],
  "reasons": [
    {
      "icon": "target",
      "title": {
        "vi": "Một đầu mối, đa năng lực",
        "en": "One partner, full capability"
      },
      "desc": {
        "vi": "Thiết kế, lập trình, bảo mật, AI và hạ tầng trong cùng một đội — không phải điều phối nhiều bên.",
        "en": "Design, development, security, AI and infrastructure in one team — no juggling multiple vendors."
      }
    },
    {
      "icon": "shield-check",
      "title": {
        "vi": "Bảo mật ngay từ thiết kế",
        "en": "Secure by design"
      },
      "desc": {
        "vi": "An toàn thông tin được tính đến từ kiến trúc, không phải vá lỗi sau khi phát hành.",
        "en": "Security is built into the architecture, not patched in after release."
      }
    },
    {
      "icon": "code",
      "title": {
        "vi": "Kỹ thuật chuẩn mực",
        "en": "Engineering excellence"
      },
      "desc": {
        "vi": "Mã nguồn sạch, có cấu trúc, có tài liệu — dễ bảo trì và dễ mở rộng về sau.",
        "en": "Clean, structured, documented code — easy to maintain and extend."
      }
    },
    {
      "icon": "eye",
      "title": {
        "vi": "Minh bạch từng bước",
        "en": "Transparent at every step"
      },
      "desc": {
        "vi": "Phạm vi, tiến độ và chi phí rõ ràng; cập nhật thường xuyên trong suốt dự án.",
        "en": "Clear scope, timeline and cost, with regular updates throughout the project."
      }
    },
    {
      "icon": "expand",
      "title": {
        "vi": "Linh hoạt theo quy mô",
        "en": "Flexible at any scale"
      },
      "desc": {
        "vi": "Phù hợp từ một landing page nhỏ đến hệ thống nhiều người dùng.",
        "en": "From a small landing page to a multi-user system."
      }
    },
    {
      "icon": "heart",
      "title": {
        "vi": "Đồng hành lâu dài",
        "en": "Long-term partnership"
      },
      "desc": {
        "vi": "Bảo trì, vận hành và phát triển tiếp sau bàn giao — vì giá trị bền vững.",
        "en": "Maintenance, operations and further development after handover — for lasting value."
      }
    }
  ],
  "security": {
    "services": [
      {
        "icon": "app-check",
        "title": {
          "vi": "Đánh giá bảo mật ứng dụng",
          "en": "Application security assessment"
        },
        "desc": {
          "vi": "Kiểm tra website, web app và API theo OWASP Top 10 và OWASP ASVS.",
          "en": "Testing websites, web apps and APIs against OWASP Top 10 and OWASP ASVS."
        }
      },
      {
        "icon": "crosshair",
        "title": {
          "vi": "Kiểm thử xâm nhập (Pentest)",
          "en": "Penetration testing"
        },
        "desc": {
          "vi": "Mô phỏng tấn công có kiểm soát vào web, API, ứng dụng di động và mạng nội bộ — black/grey/white box.",
          "en": "Controlled attack simulation on web, APIs, mobile apps and internal networks — black/grey/white box."
        }
      },
      {
        "icon": "code-scan",
        "title": {
          "vi": "Rà soát mã nguồn bảo mật",
          "en": "Secure code review"
        },
        "desc": {
          "vi": "Kết hợp công cụ phân tích tĩnh (SAST) và rà soát thủ công để tìm lỗi logic, injection, lộ bí mật.",
          "en": "Static analysis (SAST) plus manual review to find logic flaws, injection and leaked secrets."
        }
      },
      {
        "icon": "server",
        "title": {
          "vi": "Gia cố máy chủ & hạ tầng",
          "en": "Server & infrastructure hardening"
        },
        "desc": {
          "vi": "Hardening Linux, Docker, Nginx, cơ sở dữ liệu và cloud theo khuyến nghị CIS Benchmarks.",
          "en": "Hardening Linux, Docker, Nginx, databases and cloud following CIS Benchmarks."
        }
      },
      {
        "icon": "cloud-check",
        "title": {
          "vi": "Bảo mật Cloud & DevSecOps",
          "en": "Cloud security & DevSecOps"
        },
        "desc": {
          "vi": "Tích hợp quét lỗ hổng vào CI/CD, quản lý secrets, phân quyền tối thiểu và giám sát cấu hình.",
          "en": "Vulnerability scanning in CI/CD, secrets management, least privilege and configuration monitoring."
        }
      },
      {
        "icon": "alert",
        "title": {
          "vi": "Ứng phó sự cố",
          "en": "Incident response"
        },
        "desc": {
          "vi": "Điều tra khi bị tấn công, xử lý website nhiễm mã độc, khôi phục hệ thống và ngăn tái diễn.",
          "en": "Investigating attacks, cleaning infected websites, restoring systems and preventing recurrence."
        }
      },
      {
        "icon": "graduation",
        "title": {
          "vi": "Đào tạo nhận thức bảo mật",
          "en": "Security awareness training"
        },
        "desc": {
          "vi": "Giúp nhân viên nhận diện lừa đảo (phishing), dùng mật khẩu an toàn và bảo vệ dữ liệu hằng ngày.",
          "en": "Helping staff spot phishing, use strong passwords and protect data day to day."
        }
      },
      {
        "icon": "doc-check",
        "title": {
          "vi": "Chính sách & tuân thủ",
          "en": "Policy & compliance"
        },
        "desc": {
          "vi": "Xây dựng chính sách an toàn thông tin, sao lưu, phân quyền; định hướng theo ISO/IEC 27001 và quy định bảo vệ dữ liệu cá nhân.",
          "en": "Information security, backup and access policies; aligned with ISO/IEC 27001 and personal data protection regulations."
        }
      }
    ],
    "steps": [
      {
        "title": {
          "vi": "Phạm vi & ủy quyền",
          "en": "Scope & authorization"
        },
        "desc": {
          "vi": "Thống nhất mục tiêu, phạm vi, thời gian và ký văn bản ủy quyền.",
          "en": "Agree on targets, scope and timing, and sign written authorization."
        }
      },
      {
        "title": {
          "vi": "Thu thập thông tin",
          "en": "Reconnaissance"
        },
        "desc": {
          "vi": "Tìm hiểu kiến trúc, bề mặt tấn công và luồng nghiệp vụ.",
          "en": "Map the architecture, attack surface and business flows."
        }
      },
      {
        "title": {
          "vi": "Kiểm thử & đánh giá",
          "en": "Testing & assessment"
        },
        "desc": {
          "vi": "Kết hợp công cụ tự động và kiểm thử thủ công chuyên sâu.",
          "en": "Automated tooling combined with in-depth manual testing."
        }
      },
      {
        "title": {
          "vi": "Báo cáo",
          "en": "Reporting"
        },
        "desc": {
          "vi": "Liệt kê lỗ hổng theo mức độ rủi ro, kèm bằng chứng và cách khắc phục.",
          "en": "Findings ranked by risk, with evidence and remediation steps."
        }
      },
      {
        "title": {
          "vi": "Hỗ trợ khắc phục",
          "en": "Remediation support"
        },
        "desc": {
          "vi": "Đồng hành cùng đội ngũ của bạn để vá lỗ hổng đúng cách.",
          "en": "Work with your team to fix issues the right way."
        }
      },
      {
        "title": {
          "vi": "Kiểm thử lại",
          "en": "Retest"
        },
        "desc": {
          "vi": "Xác nhận các lỗ hổng đã được khắc phục triệt để.",
          "en": "Confirm that every issue has been properly fixed."
        }
      }
    ],
    "principles": {
      "vi": [
        "Chỉ kiểm thử khi có ủy quyền bằng văn bản",
        "Giữ bí mật tuyệt đối thông tin và dữ liệu của khách hàng",
        "Không làm gián đoạn hệ thống đang vận hành ngoài phạm vi đã thống nhất",
        "Báo cáo trung thực, rõ ràng, ưu tiên theo mức độ rủi ro"
      ],
      "en": [
        "Testing only with written authorization",
        "Strict confidentiality of client information and data",
        "No disruption to live systems beyond the agreed scope",
        "Honest, clear reporting prioritized by risk"
      ]
    },
    "report": {
      "vi": [
        "Tóm tắt dành cho lãnh đạo",
        "Danh sách lỗ hổng và mức độ rủi ro (theo CVSS)",
        "Bằng chứng và các bước tái hiện",
        "Khuyến nghị khắc phục cụ thể cho từng lỗ hổng",
        "Kết quả kiểm thử lại sau khắc phục"
      ],
      "en": [
        "Executive summary",
        "List of findings with risk ratings (CVSS)",
        "Evidence and reproduction steps",
        "Specific remediation advice for each finding",
        "Retest results after fixes"
      ]
    },
    "severity": [
      "Critical",
      "High",
      "Medium",
      "Low",
      "Info"
    ]
  },
  "techGroups": [
    {
      "name": {
        "vi": "Frontend",
        "en": "Frontend"
      },
      "items": [
        "React",
        "Next.js",
        "Vue",
        "TypeScript",
        "Vite",
        "Tailwind CSS"
      ]
    },
    {
      "name": {
        "vi": "Backend",
        "en": "Backend"
      },
      "items": [
        "Node.js",
        "Express",
        "NestJS",
        "Python",
        "FastAPI",
        "Go"
      ]
    },
    {
      "name": {
        "vi": "Mobile & Desktop",
        "en": "Mobile & Desktop"
      },
      "items": [
        "React Native",
        "Flutter",
        "Electron"
      ]
    },
    {
      "name": {
        "vi": "Cơ sở dữ liệu",
        "en": "Databases"
      },
      "items": [
        "PostgreSQL",
        "MySQL",
        "MongoDB",
        "Redis"
      ]
    },
    {
      "name": {
        "vi": "Cloud & DevOps",
        "en": "Cloud & DevOps"
      },
      "items": [
        "Linux",
        "Docker",
        "Kubernetes",
        "Nginx",
        "GitHub Actions",
        "Cloudflare"
      ]
    },
    {
      "name": {
        "vi": "AI & Tự động hóa",
        "en": "AI & Automation"
      },
      "items": [
        "LLM API",
        "RAG",
        "LangChain",
        "n8n",
        "Python"
      ]
    },
    {
      "name": {
        "vi": "Bảo mật",
        "en": "Security"
      },
      "items": [
        "OWASP",
        "Burp Suite",
        "Nmap",
        "Kali Linux",
        "Wireshark"
      ]
    },
    {
      "name": {
        "vi": "Thiết kế",
        "en": "Design"
      },
      "items": [
        "Figma",
        "Adobe",
        "Design System"
      ]
    }
  ],
  "engagement": [
    {
      "featured": false,
      "name": {
        "vi": "Dự án trọn gói",
        "en": "Fixed-scope project"
      },
      "desc": {
        "vi": "Phạm vi, tiến độ và chi phí được thống nhất trước khi bắt đầu.",
        "en": "Scope, timeline and cost are agreed before work begins."
      },
      "best": {
        "vi": "Website, ứng dụng, phần mềm có yêu cầu rõ ràng.",
        "en": "Websites, apps and software with clear requirements."
      },
      "points": {
        "vi": [
          "Báo giá cố định theo phạm vi",
          "Mốc bàn giao rõ ràng",
          "Nghiệm thu từng giai đoạn"
        ],
        "en": [
          "Fixed quote per scope",
          "Clear delivery milestones",
          "Phase-by-phase acceptance"
        ]
      }
    },
    {
      "featured": true,
      "name": {
        "vi": "Đội ngũ đồng hành",
        "en": "Dedicated team"
      },
      "desc": {
        "vi": "Đội ngũ VieTure làm việc cùng bạn liên tục theo tháng.",
        "en": "A VieTure team works alongside you on a monthly basis."
      },
      "best": {
        "vi": "Sản phẩm cần phát triển, cải tiến và vận hành liên tục.",
        "en": "Products that need continuous development and operation."
      },
      "points": {
        "vi": [
          "Ưu tiên linh hoạt theo từng giai đoạn",
          "Báo cáo tiến độ định kỳ",
          "Bao gồm vận hành & bảo trì"
        ],
        "en": [
          "Flexible priorities per phase",
          "Regular progress reports",
          "Operations & maintenance included"
        ]
      }
    },
    {
      "featured": false,
      "name": {
        "vi": "Tư vấn & đánh giá",
        "en": "Consulting & audit"
      },
      "desc": {
        "vi": "Đánh giá độc lập về bảo mật, kiến trúc hoặc hạ tầng hiện có.",
        "en": "Independent review of your security, architecture or infrastructure."
      },
      "best": {
        "vi": "Hệ thống đang chạy cần rà soát, tối ưu hoặc nâng cấp.",
        "en": "Running systems that need review, optimization or upgrades."
      },
      "points": {
        "vi": [
          "Đánh giá hiện trạng",
          "Báo cáo & khuyến nghị",
          "Hỗ trợ triển khai khắc phục"
        ],
        "en": [
          "Current-state assessment",
          "Report & recommendations",
          "Help implementing fixes"
        ]
      }
    }
  ],
  "projects": [],
  "custom": [],
  "values": [
    {
      "icon": "bulb",
      "name": "Innovation",
      "desc": {
        "vi": "Không ngừng sáng tạo và đổi mới.",
        "en": "Constantly creating and innovating."
      }
    },
    {
      "icon": "gear",
      "name": "Engineering",
      "desc": {
        "vi": "Đề cao chất lượng kỹ thuật và hiệu quả thực tế.",
        "en": "Valuing technical quality and real-world results."
      }
    },
    {
      "icon": "shield-check",
      "name": "Security",
      "desc": {
        "vi": "Chú trọng bảo mật và độ tin cậy.",
        "en": "Focused on security and reliability."
      }
    },
    {
      "icon": "star",
      "name": "Quality",
      "desc": {
        "vi": "Hướng đến sản phẩm chỉn chu, dễ sử dụng và dễ mở rộng.",
        "en": "Polished products that are easy to use and extend."
      }
    },
    {
      "icon": "leaf",
      "name": "Sustainability",
      "desc": {
        "vi": "Phát triển lâu dài và tạo ra giá trị bền vững.",
        "en": "Long-term growth and lasting value."
      }
    }
  ],
  "faq": [
    {
      "q": {
        "vi": "Làm thế nào để bắt đầu một dự án?",
        "en": "How do we start a project?"
      },
      "a": {
        "vi": "Bạn gửi yêu cầu qua form liên hệ hoặc email. Chúng tôi trao đổi để hiểu nhu cầu, sau đó gửi đề xuất gồm giải pháp, phạm vi, tiến độ và báo giá. Khi hai bên thống nhất, dự án bắt đầu.",
        "en": "Send a request through the contact form or email. We talk through your needs, then send a proposal covering the solution, scope, timeline and quote. Once agreed, the project starts."
      }
    },
    {
      "q": {
        "vi": "Chi phí một dự án là bao nhiêu?",
        "en": "How much does a project cost?"
      },
      "a": {
        "vi": "Chi phí phụ thuộc vào phạm vi, tính năng và thời gian thực hiện. Chúng tôi báo giá cụ thể sau khi trao đổi yêu cầu, và mọi thay đổi phạm vi đều được thống nhất trước khi thực hiện.",
        "en": "Cost depends on scope, features and timeline. We give a specific quote after discussing your requirements, and any scope change is agreed before it is done."
      }
    },
    {
      "q": {
        "vi": "Mất bao lâu để hoàn thành?",
        "en": "How long does it take?"
      },
      "a": {
        "vi": "Tùy quy mô: một landing page có thể hoàn thành trong thời gian ngắn, còn web app hay phần mềm quản lý thường cần vài tuần đến vài tháng. Tiến độ cụ thể được nêu rõ trong đề xuất.",
        "en": "It depends on scale: a landing page can be done quickly, while a web app or management system typically takes weeks to months. The exact timeline is stated in the proposal."
      }
    },
    {
      "q": {
        "vi": "Có hỗ trợ sau khi bàn giao không?",
        "en": "Do you provide support after handover?"
      },
      "a": {
        "vi": "Có. Chúng tôi hỗ trợ bảo trì, sửa lỗi, cập nhật, vận hành hạ tầng và phát triển tính năng mới theo thỏa thuận.",
        "en": "Yes. We offer maintenance, bug fixes, updates, infrastructure operations and new feature development as agreed."
      }
    },
    {
      "q": {
        "vi": "Thông tin dự án của tôi có được bảo mật?",
        "en": "Is my project information kept confidential?"
      },
      "a": {
        "vi": "Có. Thông tin và dữ liệu của khách hàng chỉ được dùng cho dự án. Chúng tôi sẵn sàng ký thỏa thuận bảo mật (NDA) khi bạn yêu cầu.",
        "en": "Yes. Client information and data are used only for the project. We are happy to sign a non-disclosure agreement (NDA) on request."
      }
    },
    {
      "q": {
        "vi": "VieTure có nhận nâng cấp hệ thống đang chạy?",
        "en": "Do you work on existing systems?"
      },
      "a": {
        "vi": "Có. Chúng tôi đánh giá hiện trạng hệ thống, sau đó đề xuất phương án nâng cấp, tối ưu hiệu năng, bổ sung tính năng hoặc tăng cường bảo mật.",
        "en": "Yes. We assess the current system, then propose upgrades, performance tuning, new features or security improvements."
      }
    },
    {
      "q": {
        "vi": "Kiểm thử bảo mật được thực hiện như thế nào?",
        "en": "How is security testing carried out?"
      },
      "a": {
        "vi": "Chỉ thực hiện khi có ủy quyền bằng văn bản từ chủ sở hữu hệ thống, với phạm vi và thời gian được thống nhất trước. Kết quả được bàn giao dưới dạng báo cáo kèm khuyến nghị khắc phục.",
        "en": "Only with written authorization from the system owner, within an agreed scope and time window. Results are delivered as a report with remediation guidance."
      }
    }
  ],
  "privacy": {
    "updated": "2026-10-17",
    "vi": {
      "title": "Chính sách bảo mật",
      "intro": "VieTure Studio tôn trọng quyền riêng tư của bạn. Chính sách này giải thích chúng tôi thu thập dữ liệu cá nhân nào qua website, dùng vào mục đích gì, lưu giữ bao lâu và quyền của bạn đối với dữ liệu đó.",
      "sections": [
        {
          "title": "1. Dữ liệu chúng tôi thu thập",
          "body": "Khi bạn gửi form liên hệ, chúng tôi nhận:\n- Họ và tên, địa chỉ email\n- Lĩnh vực quan tâm và nội dung mô tả dự án bạn nhập\n- Địa chỉ IP và thời điểm gửi (để chống spam và bảo đảm an toàn hệ thống)\nWebsite không dùng cookie theo dõi hay công cụ quảng cáo. Trình duyệt của bạn chỉ lưu lựa chọn ngôn ngữ (VI/EN) trong bộ nhớ cục bộ (localStorage) để ghi nhớ cho lần sau."
        },
        {
          "title": "2. Mục đích sử dụng",
          "body": "- Phản hồi yêu cầu, tư vấn và gửi đề xuất liên quan đến dự án của bạn\n- Liên lạc trong quá trình trao đổi và thực hiện dự án (nếu có)\n- Ngăn chặn spam, lạm dụng và bảo vệ an toàn hệ thống\nChúng tôi không dùng dữ liệu của bạn cho quảng cáo và không bán dữ liệu cho bất kỳ ai."
        },
        {
          "title": "3. Cơ sở xử lý",
          "body": "Chúng tôi chỉ xử lý dữ liệu khi bạn đồng ý bằng cách tích vào ô đồng ý trước khi gửi form. Bạn có thể rút lại sự đồng ý bất cứ lúc nào (xem mục 6)."
        },
        {
          "title": "4. Lưu trữ và chia sẻ",
          "body": "- Dữ liệu được lưu trên máy chủ do VieTure Studio quản lý.\n- Nội dung yêu cầu được chuyển tới hộp thư của chúng tôi thông qua nhà cung cấp dịch vụ email.\n- Chúng tôi chỉ chia sẻ dữ liệu khi được bạn đồng ý hoặc khi pháp luật yêu cầu."
        },
        {
          "title": "5. Thời gian lưu giữ",
          "body": "Dữ liệu liên hệ được lưu tối đa 24 tháng kể từ lần trao đổi cuối cùng, trừ khi bạn yêu cầu xóa sớm hơn hoặc pháp luật yêu cầu lưu lâu hơn."
        },
        {
          "title": "6. Quyền của bạn",
          "body": "Bạn có quyền:\n- Biết và yêu cầu xem dữ liệu chúng tôi đang lưu về bạn\n- Yêu cầu chỉnh sửa dữ liệu không chính xác\n- Yêu cầu xóa dữ liệu hoặc rút lại sự đồng ý\n- Phản đối hoặc yêu cầu hạn chế việc xử lý dữ liệu\nGửi yêu cầu tới vieturegroup@gmail.com — chúng tôi sẽ phản hồi trong thời gian sớm nhất."
        },
        {
          "title": "7. Bảo mật dữ liệu",
          "body": "Chúng tôi áp dụng các biện pháp kỹ thuật phù hợp để bảo vệ dữ liệu: mã hóa đường truyền (HTTPS), giới hạn quyền truy cập máy chủ, các header bảo mật và cơ chế chống spam. Tuy nhiên không có hệ thống nào an toàn tuyệt đối; nếu xảy ra sự cố ảnh hưởng đến dữ liệu của bạn, chúng tôi sẽ thông báo theo quy định."
        },
        {
          "title": "8. Thay đổi chính sách",
          "body": "Chính sách có thể được cập nhật. Ngày cập nhật gần nhất luôn được ghi ở đầu trang này."
        },
        {
          "title": "9. Liên hệ",
          "body": "VieTure Studio — Email: vieturegroup@gmail.com"
        }
      ]
    },
    "en": {
      "title": "Privacy Policy",
      "intro": "VieTure Studio respects your privacy. This policy explains what personal data we collect through this website, why we use it, how long we keep it and your rights over it.",
      "sections": [
        {
          "title": "1. Data we collect",
          "body": "When you submit the contact form, we receive:\n- Your name and email address\n- Your area of interest and the project description you enter\n- Your IP address and submission time (for spam prevention and system security)\nThis website uses no tracking cookies or advertising tools. Your browser only stores your language choice (VI/EN) in local storage so it is remembered next time."
        },
        {
          "title": "2. How we use it",
          "body": "- To respond to your request, advise you and send proposals about your project\n- To communicate with you during discussions and the project (if any)\n- To prevent spam and abuse and keep our systems secure\nWe do not use your data for advertising and we never sell it."
        },
        {
          "title": "3. Legal basis",
          "body": "We only process your data with your consent, given by ticking the consent box before submitting the form. You may withdraw consent at any time (see section 6)."
        },
        {
          "title": "4. Storage and sharing",
          "body": "- Data is stored on servers managed by VieTure Studio.\n- Your request is delivered to our inbox through an email service provider.\n- We only share data with your consent or where required by law."
        },
        {
          "title": "5. Retention",
          "body": "Contact data is kept for up to 24 months after our last exchange, unless you ask us to delete it sooner or the law requires a longer period."
        },
        {
          "title": "6. Your rights",
          "body": "You have the right to:\n- Know about and access the data we hold about you\n- Have inaccurate data corrected\n- Have your data deleted or withdraw your consent\n- Object to or restrict processing of your data\nSend requests to vieturegroup@gmail.com — we will respond as soon as possible."
        },
        {
          "title": "7. Security",
          "body": "We apply appropriate technical measures to protect your data: encrypted connections (HTTPS), restricted server access, security headers and anti-spam controls. No system is perfectly secure; if an incident affects your data, we will notify you as required by law."
        },
        {
          "title": "8. Changes",
          "body": "This policy may be updated. The latest update date is always shown at the top of this page."
        },
        {
          "title": "9. Contact",
          "body": "VieTure Studio — Email: vieturegroup@gmail.com"
        }
      ]
    }
  },
  "jobs": []
};
