import React, { useEffect, useState } from "react";
import { Avatar } from "@mui/material";
import userService from "../services/user.service";
import { formatDisplayName } from "../utils";

const profileLookupCache = new Map();

/** @param {string} email */
const getProfileByEmail = (email) => {
  const queryEmail = (email || "").trim();
  const normalizedEmail = queryEmail.toLowerCase();
  if (!normalizedEmail) return Promise.resolve(null);
  if (!profileLookupCache.has(normalizedEmail)) {
    const profilePromise = userService
      .getUserByEmail(queryEmail)
      .catch(() => {
        profileLookupCache.delete(normalizedEmail);
        return null;
      });
    profileLookupCache.set(
      normalizedEmail,
      profilePromise
    );
  }
  return profileLookupCache.get(normalizedEmail);
};

const imageFields = [
  "profilePicture",
  "avatar",
  "photoURL",
  "photo",
  "imageUrl",
  "picture",
];

/** @param {Record<string, any> | null | undefined} user */
const getImageSources = (user) => {
  const sources = imageFields
    .map((field) => user?.[field])
    .filter((source) => typeof source === "string" && source.trim())
    .map((source) => source.trim())
    .filter((source) => {
      if (/^(data:image\/|blob:)/i.test(source)) return true;
      try {
        const parsed = new URL(source, window.location.href);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    })
    .map((source) => {
      if (window.location.protocol === "https:" && source.startsWith("http://")) {
        return source.replace(/^http:\/\//i, "https://");
      }
      return source;
    });

  return [...new Set(sources)];
};

/** @typedef {{ user?: any, name?: string, alt?: string, onError?: (event: any) => void, [key: string]: any }} ProfileAvatarProps */
/** @param {ProfileAvatarProps} props */
const ProfileAvatar = (props) => {
  const { user, name = "", alt = "", onError = () => {}, ...avatarProps } = props;
  const email = (user?.email || "").trim().toLowerCase();
  const [resolvedProfile, setResolvedProfile] = useState(null);
  const [resolvedEmail, setResolvedEmail] = useState("");
  const effectiveUser =
    resolvedEmail === email && resolvedProfile
      ? {
          ...user,
          ...resolvedProfile,
          profilePicture:
            resolvedProfile.profilePicture ||
            resolvedProfile.avatar ||
            resolvedProfile.photoURL ||
            resolvedProfile.photo ||
            resolvedProfile.imageUrl ||
            resolvedProfile.picture ||
            user?.profilePicture,
        }
      : user;
  const sources = getImageSources(effectiveUser);
  const sourceKey = sources.join("|");
  const [attempt, setAttempt] = useState({ key: "", index: 0 });
  const currentIndex = attempt.key === sourceKey ? attempt.index : 0;
  const fallbackName = formatDisplayName(name || user?.name || user?.email || "?");
  const initial = fallbackName.trim().charAt(0).toUpperCase() || "?";

  useEffect(() => {
    if (user?.isDummy || !email || currentIndex < sources.length || resolvedEmail === email) return;
    let active = true;
    getProfileByEmail(email).then((profile) => {
      if (!active) return;
      if (profile) setResolvedProfile(profile);
      setResolvedEmail(email);
    });
    return () => {
      active = false;
    };
  }, [currentIndex, email, resolvedEmail, sources.length, user?.isDummy]);

  const handleImageError = (event) => {
    onError?.(event);
    setAttempt({ key: sourceKey, index: currentIndex + 1 });
  };

  return (
    <Avatar
      {...avatarProps}
      alt={formatDisplayName(alt || fallbackName)}
      src={sources[currentIndex]}
      slotProps={{ img: { onError: handleImageError } }}
    >
      {initial}
    </Avatar>
  );
};

export default ProfileAvatar;