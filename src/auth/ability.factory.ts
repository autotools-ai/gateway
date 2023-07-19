import { Ability, MongoAbility } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
export enum PermissionAction {
  MANAGE = 'manage',
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
}
export type PermissionObjectType = any | 'all';
export type PermissionconditionsType = any;

export type AppAbility = MongoAbility<[PermissionAction, PermissionObjectType]>;

interface CaslPermission {
  action: PermissionAction;
  subject: string;
  condition?: PermissionCondition;
}
export interface PermissionCondition {
  [key: string]: any;
}

@Injectable()
export class CaslAbilityFactory {
  constructor(private authService: AuthService) {}
  async createForUser(user: Record<string, any>): Promise<AppAbility> {
    console.log('role', user);
    const dbPermissions = await this.authService.permissions(user.roles);
    console.log('dbPermissions', dbPermissions);
    const caslPermissions: CaslPermission[] = dbPermissions.map(
      (p) => (
        console.log(
          'this.parseCondition(p.conditions, user)',
          this.parseCondition(p.conditions, user.id),
        ),
        {
          action: p.action,
          subject: p.subject,
          conditions: this.parseCondition(p.conditions, user.id),
        }
      ),
    );
    console.log('caslPermissions', caslPermissions);
    return new Ability<[PermissionAction, PermissionObjectType]>(
      caslPermissions,
    );
  }

  /**
   * @param condition: {"departmentId": "${id}"}
   * @param variables: {"id: 1"}
   * @return condition after parse: {"departmentId": 1}
   */
  public parseCondition(
    condition: PermissionCondition,
    variables: Record<string, any>,
  ): PermissionCondition {
    if (!condition) return null;
    const parsedCondition = {};
    for (const [key, rawValue] of Object.entries(condition)) {
      console.log('11111111111111111111111111key', key);
      console.log('11111111111111111rawValue', rawValue);
      console.log('variables', variables);

      if (rawValue !== null && typeof rawValue === 'object') {
        const value = this.parseCondition(rawValue, variables);
        parsedCondition[key] = value;
        continue;
      }
      if (typeof rawValue !== 'string') {
        parsedCondition[key] = rawValue;
        continue;
      }

      // find placeholder "${}""
      const matches = /^\${([a-zA-Z0-9]+)}$/.exec(rawValue);

      if (!matches) {
        parsedCondition[key] = rawValue;
        continue;
      }
      const innerValue = matches[1]; // Lấy giá trị bên trong {}
      console.log('valuesssssssssssssssss', innerValue);

      const value = variables;

      console.log('valuesssssssssssssssss', value);
      if (typeof value === 'undefined') {
        throw new ReferenceError(`Variable  is not defined`);
      }
      parsedCondition[key] = value;
    }
    console.log('parsedCondition', parsedCondition);
    return parsedCondition;
  }
}
