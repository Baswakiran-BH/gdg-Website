import React, { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { devices } from "@/constants/theme";
import {
  TeamPageContainer,
  LeadSection,
  LeadCard,
  LeadImageContainer,
  LeadDetails,
  DomainSectionsContainer,
  DomainSection,
  DomainContent,
  DomainVisual,
  DomainCard,
  DomainFeatures,
  DomainFeatureItem,
  MeetTeamButton,
  FloatingIcon
} from "./TeamPageNew.styled";
import Typography from "../display/typography/Typography";
import { useTheme } from "styled-components";
import Avatar from "../avatar/Avatar";
import Link from "next/link";
import Image from "next/image";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import MailIcon from "@mui/icons-material/Mail";
import DomainSideNav from "./DomainSideNav";
import { domainConfig } from "@/constants/domainConfig";

const DomainSectionComponent = ({ domain, index, teamSlug }) => {
  const domainSectionRef = useRef(null);
  const Icon = domain.icon;
  const isEven = index % 2 === 0;

  const { scrollYProgress } = useScroll({
    target: domainSectionRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 0.5, 1], [100, 0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);

  return (
    <DomainSection
      id={`domain-${domain.id}`}
      ref={domainSectionRef}
      backgroundColor={domain.color}
      isEven={isEven}
    >
      <motion.div style={{ y, opacity, scale }}>
        <DomainContent isEven={isEven}>
          <div style={{ flex: 1, maxWidth: "600px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                borderRadius: "999px",
                backgroundColor: `${domain.darkColor}40`,
                marginBottom: "1rem"
              }}
            >
              <Icon sx={{ fontSize: 16 }} />
              <Typography variant="bodySmall">{domain.subtitle}</Typography>
            </div>

            <Typography variant="displayLarge" style={{ marginBottom: "1rem" }}>
              {domain.title}
            </Typography>

            <Typography variant="body" style={{ marginBottom: "2rem", lineHeight: "1.6" }}>
              {domain.description}
            </Typography>

            <Link
              href={`/team/${teamSlug}/${domain.id}`}
              style={{ textDecoration: "none" }}
            >
              <MeetTeamButton>
                Meet the Team
              </MeetTeamButton>
            </Link>
          </div>

          <DomainVisual isEven={isEven}>
            <DomainCard backgroundColor={domain.darkColor}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "16px",
                  backgroundColor: domain.darkColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.5rem"
                }}
              >
                <Icon sx={{ fontSize: 40, color: "white" }} />
              </div>

              <Typography variant="h3" style={{ marginBottom: "1.5rem" }}>
                What we do
              </Typography>

              <DomainFeatures>
                {domain.features.map((feature, i) => (
                  <DomainFeatureItem
                    key={i}
                    backgroundColor={domain.color}
                    dotColor={domain.darkColor}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: domain.darkColor
                      }}
                    />
                    <Typography variant="bodySmall">{feature}</Typography>
                  </DomainFeatureItem>
                ))}
              </DomainFeatures>
            </DomainCard>

            <FloatingIcon backgroundColor={domain.darkColor}>
              <Icon sx={{ fontSize: 48, color: "white" }} />
            </FloatingIcon>
          </DomainVisual>
        </DomainContent>
      </motion.div>
    </DomainSection>
  );
};

const TeamPageNew = ({ teamData, teamSlug }) => {
  const theme = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const leadSectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: leadSectionRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 0.5, 1], [100, 0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);

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

  return (
    <TeamPageContainer>
      {/* Lead Section */}
      <LeadSection ref={leadSectionRef}>
        <DomainSideNav teamSlug={teamSlug} />
        <Typography variant="h1" style={{ marginBottom: "2rem", textAlign: "center" }}>
          {teamData.name}
        </Typography>
        
        {teamData.lead && (
          <motion.div style={{ y, opacity, scale }}>
            <LeadCard>
            <LeadImageContainer>
              <Avatar
                size={isMobile ? "xl" : "xl"}
                borderColor={theme.colors.brandBlue}
                url={teamData.lead.profile.image}
                borderWidth={4}
              />
            </LeadImageContainer>
            <LeadDetails>
              <Typography variant="h2">{teamData.lead.profile.name}</Typography>
              <Typography variant="body" style={{ color: theme.colors.brandBlue, marginBottom: "1rem" }}>
                {teamData.lead.role}
              </Typography>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                {teamData.lead.profile.profileLink && (
                  <Link
                    href={teamData.lead.profile.profileLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "0.5rem",
                      borderRadius: "50%",
                      backgroundColor: theme.colors.bgSecondary,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s"
                    }}
                  >
                    <LinkedInIcon sx={{ fontSize: 20, color: theme.colors.textPrimary }} />
                  </Link>
                )}
                {teamData.lead.profile.social && (
                  <Link
                    href={`mailto:${teamData.lead.profile.social}`}
                    style={{
                      padding: "0.5rem",
                      borderRadius: "50%",
                      backgroundColor: theme.colors.bgSecondary,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s"
                    }}
                  >
                    <MailIcon sx={{ fontSize: 20, color: theme.colors.textPrimary }} />
                  </Link>
                )}
              </div>
            </LeadDetails>
          </LeadCard>
          </motion.div>
        )}
      </LeadSection>

      {/* Domain Sections */}
      <DomainSectionsContainer>
        {domainConfig.map((domain, index) => (
          <DomainSectionComponent
            key={domain.id}
            domain={domain}
            index={index}
            teamSlug={teamSlug}
          />
        ))}
      </DomainSectionsContainer>
    </TeamPageContainer>
  );
};

export default TeamPageNew;

