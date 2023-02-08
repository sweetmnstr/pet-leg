import { UserRoles } from '../../user/enums/user-roles.enum';
import { AuthStrategiesEnum } from '../types/auth-strategies.enum';

export const AuthStrategiesConfig = Object.freeze({
  [UserRoles.Lawyer]: AuthStrategiesEnum.SESSION,
  [UserRoles.Customer]: AuthStrategiesEnum.JWT,
  [UserRoles.Admin]: AuthStrategiesEnum.SESSION,
});
