export function maskBusiness(b: any) {
  if (!b) return null;
  const {
    ownerId,
    deletedAt,
    updatedAt,
    verificationStatus,
    status,
    ...rest
  } = b;

  return {
    ...rest,
    isVerified: verificationStatus === "verified",
  };
}

export function maskProvider(p: any) {
  if (!p) return null;
  const {
    profileId,
    memberId,
    deletedAt,
    updatedAt,
    verificationStatus,
    status,
    ...rest
  } = p;

  return {
    ...rest,
    isVerified: verificationStatus === "verified",
  };
}
