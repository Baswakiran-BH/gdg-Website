import CodeIcon from "@mui/icons-material/Code";
import PsychologyIcon from "@mui/icons-material/Psychology";
import PaletteIcon from "@mui/icons-material/Palette";
import ArticleIcon from "@mui/icons-material/Article";
import PeopleIcon from "@mui/icons-material/People";

export const domainConfig = [
  {
    id: "tech",
    title: "Tech",
    subtitle: "Web & Cloud Development",
    description: "Explore cutting-edge web technologies, cloud computing, and software engineering. From frontend frameworks to backend architectures, we build the future.",
    color: "#f8d8d8",
    darkColor: "#e5a3a3",
    icon: CodeIcon,
    features: ["React & Next.js", "Cloud Platforms", "DevOps & CI/CD", "Open Source"]
  },
  {
    id: "ml-android",
    title: "ML & Android",
    subtitle: "AI & Mobile Innovation",
    description: "Dive into machine learning, artificial intelligence, and Android development. Build smart apps that learn and adapt.",
    color: "#c3ecf6",
    darkColor: "#7dd3e8",
    icon: PsychologyIcon,
    features: ["TensorFlow & PyTorch", "Android Studio", "Kotlin & Jetpack", "Edge AI"]
  },
  {
    id: "design",
    title: "Design",
    subtitle: "UI/UX & Creative Vision",
    description: "Craft beautiful, intuitive experiences. From wireframes to polished interfaces, design that users love.",
    color: "#ccf6c5",
    darkColor: "#8fe880",
    icon: PaletteIcon,
    features: ["Figma & Adobe XD", "Design Systems", "User Research", "Prototyping"]
  },
  {
    id: "content",
    title: "Content",
    subtitle: "Stories & Documentation",
    description: "Tell compelling stories through blogs, videos, and documentation. Share knowledge and inspire the community.",
    color: "#ffe7a5",
    darkColor: "#ffd54f",
    icon: ArticleIcon,
    features: ["Technical Writing", "Video Production", "Social Media", "Podcasting"]
  },
  {
    id: "community",
    title: "Community",
    subtitle: "Connect & Grow Together",
    description: "Build lasting connections, organize events, and foster an inclusive environment where everyone belongs.",
    color: "#f0f0f0",
    darkColor: "#c0c0c0",
    icon: PeopleIcon,
    features: ["Hackathons", "Meetups", "Mentorship", "Networking"]
  }
];

export const getDomainById = (id) => domainConfig.find((d) => d.id === id);

export const validDomains = domainConfig.map((d) => d.id);

export const roleMatchesDomain = (role, domain) => {
  if (!role) return false;
  const roleLower = role.toLowerCase();
  
  if (domain === "tech") {
    return roleLower.includes("technical") || 
           roleLower.includes("tech") || 
           roleLower.includes("web") || 
           roleLower.includes("developer") ||
           roleLower.includes("development");
  } else if (domain === "ml-android") {
    return roleLower.includes("android") || 
           roleLower.includes("ml") || 
           roleLower.includes("machine learning") || 
           roleLower.includes("ai") ||
           roleLower.includes("artificial intelligence");
  } else if (domain === "design") {
    return roleLower.includes("design") || 
           roleLower.includes("designer") || 
           roleLower.includes("ui") || 
           roleLower.includes("ux") ||
           roleLower.includes("graphic");
  } else if (domain === "content") {
    return roleLower.includes("content") || 
           roleLower.includes("writer") || 
           roleLower.includes("writing") || 
           roleLower.includes("blog") ||
           roleLower.includes("blogger");
  } else if (domain === "community") {
    return roleLower.includes("community") || 
           roleLower.includes("management") || 
           roleLower.includes("manager") || 
           roleLower.includes("outreach");
  }
  return false;
};
