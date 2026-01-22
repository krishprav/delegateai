import { asyncHandler, ApiResponse, CustomError } from "@delegate/auth";
import fs from "fs";
import path from "path";
import { credentialsService } from "../services/index.js";

export const getCredentialApis = asyncHandler(async (req, res) => {
  const credFilePath = path.join(process.cwd(), "src", "credentials.json");
  const fileData = fs.readFileSync(credFilePath, "utf-8");
  const data = JSON.parse(fileData);

  res.status(200).json(new ApiResponse(200, "path", data));
});

export const createCredentials = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  try {
    const createdCred = await credentialsService.createCredential(userId, req.body);

    res
      .status(200)
      .json(
        new ApiResponse(200, "credentials created successfully", createdCred)
      );
  } catch (error) {
    throw new CustomError(403, "Failed to create credentials");
  }
});

export const updateCredential = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { credId } = req.params;

  if (!credId) throw new CustomError(400, "Credential ID is required");

  try {
    const updatedCred = await credentialsService.updateCredential(credId, userId, req.body);

    res
      .status(200)
      .json(new ApiResponse(200, "updated successfuly ", updatedCred));
  } catch (error: any) {
    if (error.message === "Credential not found or does not belong to you") {
      throw new CustomError(401, error.message);
    }
    throw new CustomError(403, "updated cred failed due to input validation");
  }
});

export const getAllCredentials = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  if (!userId) throw new CustomError(404, "User id is invalid");

  const allUserCred = await credentialsService.getAllCredentials(userId);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Retrieved all the credentionls for the user",
        allUserCred
      )
    );
});

export const deleteCredentials = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { credId } = req.params;

  if (!credId) throw new CustomError(400, "Credential ID is required");

  try {
    const deletedCred = await credentialsService.deleteCredential(credId);

    res.status(200).json(new ApiResponse(200, "deleted the cred", deletedCred));
  } catch (error) {
    throw new CustomError(400, "failed to delete the cred");
  }
});
