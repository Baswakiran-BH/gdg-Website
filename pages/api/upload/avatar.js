import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { uploadToSupabase, uploadBase64ToSupabase } from "@/lib/uploadToSupabase";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Limit to 10MB for image uploads
    },
  },
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(StatusCodes.METHOD_NOT_ALLOWED).json({
      status: StatusCodes.METHOD_NOT_ALLOWED,
      error: ReasonPhrases.METHOD_NOT_ALLOWED,
    });
  }

  try {
    const { profileId, image, fileName, bucketName = 'profile-images', folder = 'avatars' } = req.body;

    if (!profileId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        error: "profileId is required",
      });
    }

    if (!image) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        error: "image is required (base64 string or file buffer)",
      });
    }

    let uploadResult;

    // Handle base64 encoded image
    if (typeof image === 'string' && (image.startsWith('data:image') || image.length > 100)) {
      // Assume it's base64
      const defaultFileName = fileName || `avatar-${profileId}.png`;
      uploadResult = await uploadBase64ToSupabase(image, defaultFileName, bucketName, folder);
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        error: "Invalid image format. Please provide a base64 encoded image string.",
      });
    }

    // Update the profile with the new image URL
    const updatedProfile = await prisma.profile.update({
      where: { id: parseInt(profileId) },
      data: { image: uploadResult.url },
    });

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: "Avatar uploaded successfully",
      data: {
        profile: updatedProfile,
        imageUrl: uploadResult.url,
        imagePath: uploadResult.path,
      },
    });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(StatusCodes.NOT_FOUND).json({
          status: StatusCodes.NOT_FOUND,
          error: "Profile not found",
        });
      }
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error: error.message || ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  } finally {
    await prisma.$disconnect();
  }
}
