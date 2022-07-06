exports.getUserShortInfo = (userInfo) => {
  const {
    _id,
    fullName,
    email,
    phone,
    birthday,
    language,
    currency
  } = userInfo

  return {
    _id,
    fullName,
    email,
    phone,
    birthday,
    language,
    currency
  }
}