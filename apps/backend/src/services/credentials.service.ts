import { prisma } from "@delegate/db";
import z from "zod";

const createCredentialsSchema = z.object({
  name: z.string(),
  type: z.string().optional(),
  appIcon: z.string().optional(),
  application: z.string().optional(),
  apiName: z.string().optional(),
  data: z.object({
    accessToken: z.string().optional(),
    baseUrl: z.string().optional(),
    apiKey: z.string().optional(),
    organizationId: z.string().optional(),
    url: z.string().optional(),
    allowedHttpRequestDomains: z.string().optional(),
    allowedDomains: z.string().optional(),
  }),
});

const updateCredentialsSchema = z.object({
  name: z.string().optional(),
  type: z.string().nullable().optional(),
  appIcon: z.string().optional(),
  apiName: z.string().optional(),
  application: z.string().optional(),
  data: z
    .object({
      accessToken: z.string().optional(),
      baseUrl: z.string().optional(),
      apiKey: z.string().optional(),
      organizationId: z.string().optional(),
      url: z.string().optional(),
      allowedHttpRequestDomains: z.string().optional(),
      allowedDomains: z.string().optional(),
    })
    .partial()
    .optional(),
});

export class CredentialsService {
  async createCredential(userId: string, credData: any) {
    const validatedData = createCredentialsSchema.parse(credData);

    const createdCred = await prisma.userCredentials.create({
      data: {
        name: validatedData.name,
        apiName: validatedData.apiName,
        appIcon: validatedData.appIcon,
        application: validatedData.application,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        data: validatedData.data,
      },
    });

    return createdCred;
  }

  async updateCredential(credId: string, userId: string, credData: any) {
    const validatedData = updateCredentialsSchema.parse(credData);

    const existingCred = await prisma.userCredentials.findFirst({
      where: {
        id: credId,
        userId,
      },
    });

    if (!existingCred) {
      throw new Error("Credential not found or does not belong to you");
    }

    const updatedCred = await prisma.userCredentials.update({
      where: { id: credId },
      data: {
        name: existingCred.name,
        type: existingCred.type,
        appIcon: existingCred.appIcon,
        apiName: existingCred.apiName,
        data:
          validatedData.data
            ? ({ ...(existingCred.data as Record<string, unknown>), ...validatedData.data } as any)
            : existingCred.data,
        updatedAt: new Date(),
      },
    });

    return updatedCred;
  }

  async getAllCredentials(userId: string) {
    const credentials = await prisma.userCredentials.findMany({
      where: {
        userId,
      },
    });

    return credentials;
  }

  async deleteCredential(credId: string) {
    const deletedCred = await prisma.userCredentials.delete({
      where: {
        id: credId,
      },
    });

    return deletedCred;
  }
}

export const credentialsService = new CredentialsService();
