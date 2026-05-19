import { z } from "zod";

const ArtistSocialsSchema = z.object({
  youtube: z.string().nullable(),
  spotify: z.string().nullable(),
  instagram: z.string().nullable(),
});

export const ArtistProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  type: z.string(),
  country: z.string().nullable(),
  genres: z.array(z.string()),
  bio: z.string(),
  image: z.string().nullable(),
  cover_image: z.string().nullable(),
  verified: z.boolean(),
  socials: ArtistSocialsSchema,
});

export type ArtistProfile = z.infer<typeof ArtistProfileSchema>;

export const ArtistsDbSchema = z.object({
  artists: z.array(ArtistProfileSchema),
});

export type ArtistsDb = z.infer<typeof ArtistsDbSchema>;
