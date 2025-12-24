import TeamPageNew from "@/components/team/TeamPageNew";
import prisma from "@/lib/prisma";
import Head from "next/head";
import React from "react";
import fs from "fs";
import path from "path";
import { transformTeamData } from "@/utils/transformTeamData";

const Team = ({ teamData, teamSlug }) => {
  return (
    <>
      <Head>
        <title>{teamData.name} | GDSC MVJCE</title>
        <meta
          name="description"
          content={
            "The amazing team behind GDSC MVJCE working dilligently towards empowering the student developer community in our college."
          }
        />
        <meta property="og:title" content={teamData.name + " | GDSC MVJCE"} />
        <meta
          property="og:description"
          content={
            "The amazing team behind GDSC MVJCE working dilligently towards empowering the student developer community in our college."
          }
        />
        <meta property="og:image" content={"/images/gdsc_fallback.png"} />
      </Head>
      <TeamPageNew teamData={teamData} teamSlug={teamSlug} />
    </>
  );
};

export default Team;

export const getStaticProps = async (ctx) => {
  const { slug } = ctx.params;
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
      let teamData = {};

      const { name, members } = response;

      teamData = {
        name,
        lead: members.find((member) => member.type === "lead"),
        members: members.filter((member) => member.type === "member"),
        core: members.filter((member) => member.type === "core")
      };

      return {
        props: {
          teamData,
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
    const response = await prisma.team.findMany({
      select: {
        slug: true
      }
    });
    paths = response.map((team) => ({
      params: {
        slug: team.slug
      }
    }));
  } catch (error) {
    // If database is unavailable, log error and continue with static paths only
    console.warn("Database connection failed in getStaticPaths, using static paths only:", error.message);
  }

  // Add Team paths (static JSON data)
  const staticTeams = ["2021", "2022", "2023", "2024", "2025"];
  staticTeams.forEach(slug => {
    paths.push({
      params: {
        slug: slug
      }
    });
  });

  return {
    paths,
    fallback: "blocking"
  };
};
