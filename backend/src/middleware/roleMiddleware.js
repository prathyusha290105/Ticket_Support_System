/**
 * Restricts route access to specified roles
 * @param  {...string} roles Allowed roles, e.g. 'AGENT', 'CUSTOMER'
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required prior to authorization.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role '${req.user.role}' is not authorized to perform this action.`
      });
    }

    next();
  };
};

module.exports = { authorize };
