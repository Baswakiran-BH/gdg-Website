import React, { useEffect, useState } from "react";
import { devices } from "@/constants/theme";
import {
  DomainTeamPageContainer,
  DomainHeader,
  BackButton,
  DomainTitle,
  TeamLeadSection,
  TeamMembersSection,
  MemberGrid,
  MemberCard,
  MemberImageContainer,
  MemberName,
  MemberActions
} from "./DomainTeamPage.styled";
import Typography from "../display/typography/Typography";
import { useTheme } from "styled-components";
import Avatar from "../avatar/Avatar";
import Link from "next/link";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import MailIcon from "@mui/icons-material/Mail";
import CodeIcon from "@mui/icons-material/Code";
import { getDomainById, roleMatchesDomain } from "@/constants/domainConfig";

const DomainTeamPage = ({ teamData, domain, teamSlug }) => {
  const theme = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(devices.lg);
    setIsMobile(mediaQuery.matches);

    const handleMediaQueryChange = (event) => {
      setIsMobile(event.matches);
    };

    mediaQuery.addEventListener("change", handleMediaQueryChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
    };
  }, []);

  const domainInfo = getDomainById(domain) || getDomainById("tech");
  const Icon = domainInfo.icon || CodeIcon;
  const colors = { color: domainInfo.color, darkColor: domainInfo.darkColor };
  const domainTitle = domainInfo.title;

  // Filter members by domain
  const allMembers = [...(teamData.core || []), ...(teamData.members || [])];
  const domainMembers = allMembers.filter((member) => 
    member && member.role && roleMatchesDomain(member.role, domain)
  );

  // Find domain lead (first core member or first member)
  const domainLead = domainMembers.find((member) => member && member.type === "core") || domainMembers[0];
  const domainTeamMembers = domainMembers.filter((member) => member && member.id && member.id !== domainLead?.id);

  const borderColors = [
    theme.colors.brandBlue,
    theme.colors.brandGreen,
    theme.colors.brandRed,
    theme.colors.brandYellow
  ];

  return (
    <DomainTeamPageContainer>
      <DomainHeader backgroundColor={colors.color}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", position: "relative" }}>
          <Link
            href={`/team/${teamSlug}`}
            style={{ textDecoration: "none", marginLeft: "1rem" }}
          >
            <BackButton>
              <ArrowBackIcon sx={{ fontSize: 20 }} />
              <span>Back to Team</span>
            </BackButton>
          </Link>
          <DomainTitle style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", width: "fit-content" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                backgroundColor: colors.darkColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Icon sx={{ fontSize: 16, color: "white" }} />
            </div>
            <Typography variant="h2" style={{ margin: 0 }}>
              {domainTitle} Team
            </Typography>
          </DomainTitle>
          <div style={{ width: "140px" }} /> {/* Spacer to balance layout */}
        </div>
      </DomainHeader>

      <main style={{ width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "4rem 2rem" }}>
        {/* Team Lead Section */}
        {domainLead && domainLead.profile && (
          <TeamLeadSection>
            <Typography variant="h1" style={{ textAlign: "center", marginBottom: "3rem" }}>
              Team Lead
            </Typography>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <MemberCard>
                <MemberImageContainer borderColor={colors.darkColor}>
                  <Avatar
                    size={isMobile ? "xl" : "xl"}
                    borderColor={colors.darkColor}
                    url={domainLead.profile?.image}
                    borderWidth={4}
                  />
                </MemberImageContainer>
                <MemberName>
                  <Typography variant="h3">{domainLead.profile?.name || "Unknown"}</Typography>
                </MemberName>
                <MemberActions>
                  {domainLead.profile?.profileLink && (
                    <Link
                      href={domainLead.profile.profileLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        backgroundColor: theme.colors.bgSecondary,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s"
                      }}
                    >
                      <LinkedInIcon sx={{ fontSize: 16, color: theme.colors.textPrimary }} />
                    </Link>
                  )}
                  {domainLead.profile?.social && (
                    <Link
                      href={`mailto:${domainLead.profile.social}`}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        backgroundColor: theme.colors.bgSecondary,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s"
                      }}
                    >
                      <MailIcon sx={{ fontSize: 16, color: theme.colors.textPrimary }} />
                    </Link>
                  )}
                </MemberActions>
              </MemberCard>
            </div>
          </TeamLeadSection>
        )}

        {/* Team Members Section */}
        {domainTeamMembers.length > 0 && (
          <TeamMembersSection>
            <Typography variant="h1" style={{ textAlign: "center", marginBottom: "3rem" }}>
              Team Members
            </Typography>
            <MemberGrid>
              {domainTeamMembers.filter(member => member && member.profile).map((member, index) => (
                <MemberCard key={member.id || index}>
                  <MemberImageContainer borderColor={borderColors[index % 4]}>
                    <Avatar
                      size={isMobile ? "lg" : "xl"}
                      borderColor={borderColors[index % 4]}
                      url={member.profile?.image}
                      borderWidth={4}
                    />
                  </MemberImageContainer>
                  <MemberName>
                    <Typography variant="h5">{member.profile?.name || "Unknown"}</Typography>
                  </MemberName>
                  <MemberActions>
                    {member.profile?.profileLink && (
                      <Link
                        href={member.profile.profileLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          backgroundColor: theme.colors.bgSecondary,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s"
                        }}
                      >
                        <LinkedInIcon sx={{ fontSize: 16, color: theme.colors.textPrimary }} />
                      </Link>
                    )}
                    {member.profile?.social && (
                      <Link
                        href={`mailto:${member.profile.social}`}
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          backgroundColor: theme.colors.bgSecondary,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s"
                        }}
                      >
                        <MailIcon sx={{ fontSize: 16, color: theme.colors.textPrimary }} />
                      </Link>
                    )}
                  </MemberActions>
                </MemberCard>
              ))}
            </MemberGrid>
          </TeamMembersSection>
        )}

        {/* Back to domains */}
        <div style={{ textAlign: "center", marginTop: "4rem" }}>
          <Link
            href={`/team/${teamSlug}`}
            style={{ textDecoration: "none" }}
          >
            <button
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "1rem 2rem",
                backgroundColor: theme.colors.textPrimary,
                color: "white",
                border: "none",
                borderRadius: "999px",
                fontWeight: 600,
                fontSize: "1rem",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
            >
              <ArrowBackIcon sx={{ fontSize: 20 }} />
              Explore Other Domains
            </button>
          </Link>
        </div>
      </main>
    </DomainTeamPageContainer>
  );
};

export default DomainTeamPage;

