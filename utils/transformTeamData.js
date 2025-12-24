/**
 * Constructs a Supabase storage public URL
 * @param {string} fileName - The filename (e.g., "gurbashish-sena-nayak.png")
 * @param {string} bucketName - The bucket name (default: "gallery-images")
 * @param {string} folder - The folder path (default: "Team_2025")
 * @returns {string} The full public URL or fallback
 */
const getSupabaseImageUrl = (fileName, bucketName = "gallery-images", folder = "Team_2025") => {
  // Get Supabase URL from environment variable
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    console.warn("⚠️ NEXT_PUBLIC_SUPABASE_URL not set, cannot construct Supabase image URL for:", fileName);
    return "/images/gdsc_fallback.png";
  }
  
  // Construct the public URL: https://[PROJECT-REF].supabase.co/storage/v1/object/public/[bucket]/[folder]/[file]
  const filePath = folder ? `${folder}/${fileName}` : fileName;
  const fullUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filePath}`;
  
  // Debug logging (only in development)
  if (process.env.NODE_ENV === "development") {
    console.log(`[Supabase Image] ${fileName} -> ${fullUrl}`);
  }
  
  return fullUrl;
};

/**
 * Transforms JSON team data structure to match the component's expected format
 * Converts flat structure to nested structure with profile objects
 */
export const transformTeamData = (jsonData) => {
  if (!jsonData || !jsonData.members) {
    return {
      name: jsonData?.title || "Team",
      lead: null,
      core: [],
      members: []
    };
  }

  const { title, members } = jsonData;

  // Transform each member from flat structure to nested structure
  const transformedMembers = members.map((member, index) => {
    // Determine type based on role
    let type = "member";
    if (member.role.toLowerCase() === "lead" || member.role.toLowerCase() === "organizer") {
      type = "lead";
    } else if (
      member.role.toLowerCase().includes("lead") ||
      member.role.toLowerCase().includes("tech") ||
      member.role.toLowerCase().includes("ml") ||
      member.role.toLowerCase().includes("design") ||
      member.role.toLowerCase().includes("content") ||
      member.role.toLowerCase().includes("community") ||
      member.role.toLowerCase() === "tech" ||
      member.role.toLowerCase() === "ml" ||
      member.role.toLowerCase() === "design" ||
      member.role.toLowerCase() === "content" ||
      member.role.toLowerCase() === "community"
    ) {
      type = "core";
    }

    // Handle avatar URL - if it starts with "supabase://", construct the Supabase URL
    // Trim and check for empty/whitespace-only strings
    let avatarUrl = (member.avatar && member.avatar.trim()) || "/images/gdsc_fallback.png";
    if (avatarUrl && avatarUrl.startsWith("supabase://")) {
      // Construct filename in format: name.role.position.png
      const normalizeName = (name) => name.toLowerCase().replace(/\s+/g, "");
      const extractRole = (role) => {
        // Extract the first meaningful word(s) from role
        // "Tech Member" -> "tech", "ML and Android Lead" -> "ml-android", "Design Member" -> "design"
        const words = role.toLowerCase().split(/\s+/);
        if (words.length > 2 && words[0] === "ml") {
          // Handle "ML and Android" -> "ml-android"
          return words.slice(0, 3).filter(w => w !== "and").join("-");
        }
        return words[0]; // Take first word
      };
      const extractPosition = (position) => {
        // Extract the last word as position: "Tech Member" -> "member", "Organizer" -> "organizer"
        const words = position.toLowerCase().split(/\s+/);
        return words[words.length - 1];
      };
      
      const namePart = normalizeName(member.name);
      const rolePart = extractRole(member.role || member.position || "");
      const positionPart = extractPosition(member.position || member.role || "");
      const fileName = `${namePart}.${rolePart}.${positionPart}.png`;
      
      if (process.env.NODE_ENV === "development") {
        console.log(`[Avatar] ${member.name} -> ${fileName}`);
      }
      
      avatarUrl = getSupabaseImageUrl(fileName);
    }
    
    // Ensure avatarUrl is never empty or just whitespace
    if (!avatarUrl || !avatarUrl.trim()) {
      avatarUrl = "/images/gdsc_fallback.png";
    }

    // Transform to nested structure matching database format
    return {
      id: `member-${index}-${member.name.toLowerCase().replace(/\s+/g, "-")}`,
      role: member.role,
      type: type,
      priority: index,
      profile: {
        name: member.name,
        image: avatarUrl.trim(),
        profileLink: member.links?.linkedin || "",
        social: member.links?.email || "",
        bio: member.bio || "",
        username: member.name.toLowerCase().replace(/\s+/g, "-"),
        about: member.bio || "",
        coverPhoto: null
      }
    };
  });

  // Find lead
  const lead = transformedMembers.find((member) => member.type === "lead") || null;

  // Separate core and regular members (excluding lead)
  const core = transformedMembers.filter(
    (member) => member.type === "core"
  );
  const regularMembers = transformedMembers.filter((member) => member.type === "member");

  return {
    name: title,
    lead: lead,
    core: core,
    members: regularMembers
  };
};

