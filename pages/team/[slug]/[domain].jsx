import DomainTeamPage from "@/components/team/DomainTeamPage";
import prisma from "@/lib/prisma";
import Head from "next/head";
import React from "react";
import fs from "fs";
import path from "path";
import { transformTeamData } from "@/utils/transformTeamData";
import { validDomains, getDomainById } from "@/constants/domainConfig";

const DomainTeam = ({ teamData, domain, teamSlug }) => {
  const domainInfo = getDomainById(domain) || { title: "Tech" };
  const domainTitle = domainInfo.title;

  return (
    <>
      <Head>
        <title>{teamData.name} - {domainTitle} Team | GDSC MVJCE</title>
        <meta
          name="description"
          content={`${domainTitle} team members of ${teamData.name}`}
        />
      </Head>
      <DomainTeamPage teamData={teamData} domain={domain} teamSlug={teamSlug} />
    </>
  );
};

export default DomainTeam;

export const getStaticProps = async (ctx) => {
  const { slug, domain } = ctx.params;
  
  // Validate domain
  if (!validDomains.includes(domain)) {
    return {
      notFound: true
    };
  }
  
  const forceJsonTeams = ["2024", "2025"];

  // For 2024 and 2025, always use JSON
  if (forceJsonTeams.includes(slug)) {
    try {
      const filePath = path.join(process.cwd(), "data", "teams", `${slug}.json`);
      const fileContents = fs.readFileSync(filePath, "utf8");
      const jsonData = JSON.parse(fileContents);
      const teamData = transformTeamData(jsonData);

      return {
        props: {
          teamData,
          domain,
          teamSlug: slug
        }
      };
    } catch (error) {
      console.error(`Error loading Team ${slug} data:`, error);
      return {
        notFound: true
      };
    }
  }
  
  // For other teams, try loading from database first
  try {
    const response = await prisma.team.findUnique({
      include: {
        members: {
          include: {
            profile: true
          },
          orderBy: {
            priority: "asc"
          }
        }
      },
      where: {
        slug: slug
      }
    });
    
    if (response) {
      const { name, members } = response;
      
      const teamData = {
        name,
        lead: members.find((member) => member.type === "lead"),
        members: members.filter((member) => member.type === "member"),
        core: members.filter((member) => member.type === "core")
      };

      return {
        props: {
          teamData,
          domain,
          teamSlug: slug
        }
      };
    }
  } catch (error) {
    console.error("Database connection failed in getStaticProps:", error.message);
  }

  // If database lookup fails or returns no data, try fallback JSON (e.g. for 2021, 2022, 2023)
  try {
    const filePath = path.join(process.cwd(), "data", "teams", `${slug}.json`);
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, "utf8");
      const jsonData = JSON.parse(fileContents);
      const teamData = transformTeamData(jsonData);

      return {
        props: {
          teamData,
          domain,
          teamSlug: slug
        }
      };
    }
  } catch (error) {
    console.error(`Error loading fallback Team ${slug} data:`, error);
  }

  return {
    notFound: true
  };
};

export const getStaticPaths = async (ctx) => {
  let paths = [];
  
  try {
    // Try to fetch teams from database
    const teams = await prisma.team.findMany({
      select: {
        slug: true
      }
    });
    
    paths = teams.flatMap((team) =>
      validDomains.map((domain) => ({
        params: {
          slug: team.slug,
          domain: domain
        }
      }))
    );
  } catch (error) {
    // If database is unavailable, log error and continue with static paths only
    console.warn("Database connection failed in getStaticPaths, using static paths only:", error.message);
  }

  // Add Team paths (static JSON data)
  const staticTeams = ["2021", "2022", "2023", "2024", "2025"];
  staticTeams.forEach((year) => {
    validDomains.forEach((domain) => {
      paths.push({
        params: {
          slug: year,
          domain: domain
        }
      });
    });
  });

  return {
    paths,
    fallback: "blocking"
  };
};
