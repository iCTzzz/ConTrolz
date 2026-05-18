import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { ActiveEmployee, AttendanceAction, AttendanceLog, AttendanceLogUpdate, AttendanceLogsResponse, DashboardStats, Employee, EmployeeInput, EmployeeUpdate, ErrorResponse, GetRecentActivityParams, HealthStatus, ListAttendanceLogsParams, ListEmployeesParams } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListEmployeesUrl: (params?: ListEmployeesParams) => string;
/**
 * @summary List all employees
 */
export declare const listEmployees: (params?: ListEmployeesParams, options?: RequestInit) => Promise<Employee[]>;
export declare const getListEmployeesQueryKey: (params?: ListEmployeesParams) => readonly ["/api/employees", ...ListEmployeesParams[]];
export declare const getListEmployeesQueryOptions: <TData = Awaited<ReturnType<typeof listEmployees>>, TError = ErrorType<unknown>>(params?: ListEmployeesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listEmployees>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listEmployees>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListEmployeesQueryResult = NonNullable<Awaited<ReturnType<typeof listEmployees>>>;
export type ListEmployeesQueryError = ErrorType<unknown>;
/**
 * @summary List all employees
 */
export declare function useListEmployees<TData = Awaited<ReturnType<typeof listEmployees>>, TError = ErrorType<unknown>>(params?: ListEmployeesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listEmployees>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateEmployeeUrl: () => string;
/**
 * @summary Create a new employee
 */
export declare const createEmployee: (employeeInput: EmployeeInput, options?: RequestInit) => Promise<Employee>;
export declare const getCreateEmployeeMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createEmployee>>, TError, {
        data: BodyType<EmployeeInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createEmployee>>, TError, {
    data: BodyType<EmployeeInput>;
}, TContext>;
export type CreateEmployeeMutationResult = NonNullable<Awaited<ReturnType<typeof createEmployee>>>;
export type CreateEmployeeMutationBody = BodyType<EmployeeInput>;
export type CreateEmployeeMutationError = ErrorType<ErrorResponse>;
/**
* @summary Create a new employee
*/
export declare const useCreateEmployee: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createEmployee>>, TError, {
        data: BodyType<EmployeeInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createEmployee>>, TError, {
    data: BodyType<EmployeeInput>;
}, TContext>;
export declare const getGetEmployeeUrl: (id: string) => string;
/**
 * @summary Get employee by ID
 */
export declare const getEmployee: (id: string, options?: RequestInit) => Promise<Employee>;
export declare const getGetEmployeeQueryKey: (id: string) => readonly [`/api/employees/${string}`];
export declare const getGetEmployeeQueryOptions: <TData = Awaited<ReturnType<typeof getEmployee>>, TError = ErrorType<ErrorResponse>>(id: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getEmployee>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getEmployee>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetEmployeeQueryResult = NonNullable<Awaited<ReturnType<typeof getEmployee>>>;
export type GetEmployeeQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get employee by ID
 */
export declare function useGetEmployee<TData = Awaited<ReturnType<typeof getEmployee>>, TError = ErrorType<ErrorResponse>>(id: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getEmployee>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateEmployeeUrl: (id: string) => string;
/**
 * @summary Update an employee
 */
export declare const updateEmployee: (id: string, employeeUpdate: EmployeeUpdate, options?: RequestInit) => Promise<Employee>;
export declare const getUpdateEmployeeMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateEmployee>>, TError, {
        id: string;
        data: BodyType<EmployeeUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateEmployee>>, TError, {
    id: string;
    data: BodyType<EmployeeUpdate>;
}, TContext>;
export type UpdateEmployeeMutationResult = NonNullable<Awaited<ReturnType<typeof updateEmployee>>>;
export type UpdateEmployeeMutationBody = BodyType<EmployeeUpdate>;
export type UpdateEmployeeMutationError = ErrorType<ErrorResponse>;
/**
* @summary Update an employee
*/
export declare const useUpdateEmployee: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateEmployee>>, TError, {
        id: string;
        data: BodyType<EmployeeUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateEmployee>>, TError, {
    id: string;
    data: BodyType<EmployeeUpdate>;
}, TContext>;
export declare const getDeleteEmployeeUrl: (id: string) => string;
/**
 * @summary Delete an employee
 */
export declare const deleteEmployee: (id: string, options?: RequestInit) => Promise<void>;
export declare const getDeleteEmployeeMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteEmployee>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteEmployee>>, TError, {
    id: string;
}, TContext>;
export type DeleteEmployeeMutationResult = NonNullable<Awaited<ReturnType<typeof deleteEmployee>>>;
export type DeleteEmployeeMutationError = ErrorType<ErrorResponse>;
/**
* @summary Delete an employee
*/
export declare const useDeleteEmployee: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteEmployee>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteEmployee>>, TError, {
    id: string;
}, TContext>;
export declare const getCheckInUrl: () => string;
/**
 * @summary Register employee check-in
 */
export declare const checkIn: (attendanceAction: AttendanceAction, options?: RequestInit) => Promise<AttendanceLog>;
export declare const getCheckInMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof checkIn>>, TError, {
        data: BodyType<AttendanceAction>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof checkIn>>, TError, {
    data: BodyType<AttendanceAction>;
}, TContext>;
export type CheckInMutationResult = NonNullable<Awaited<ReturnType<typeof checkIn>>>;
export type CheckInMutationBody = BodyType<AttendanceAction>;
export type CheckInMutationError = ErrorType<ErrorResponse>;
/**
* @summary Register employee check-in
*/
export declare const useCheckIn: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof checkIn>>, TError, {
        data: BodyType<AttendanceAction>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof checkIn>>, TError, {
    data: BodyType<AttendanceAction>;
}, TContext>;
export declare const getCheckOutUrl: () => string;
/**
 * @summary Register employee check-out
 */
export declare const checkOut: (attendanceAction: AttendanceAction, options?: RequestInit) => Promise<AttendanceLog>;
export declare const getCheckOutMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof checkOut>>, TError, {
        data: BodyType<AttendanceAction>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof checkOut>>, TError, {
    data: BodyType<AttendanceAction>;
}, TContext>;
export type CheckOutMutationResult = NonNullable<Awaited<ReturnType<typeof checkOut>>>;
export type CheckOutMutationBody = BodyType<AttendanceAction>;
export type CheckOutMutationError = ErrorType<ErrorResponse>;
/**
* @summary Register employee check-out
*/
export declare const useCheckOut: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof checkOut>>, TError, {
        data: BodyType<AttendanceAction>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof checkOut>>, TError, {
    data: BodyType<AttendanceAction>;
}, TContext>;
export declare const getListAttendanceLogsUrl: (params?: ListAttendanceLogsParams) => string;
/**
 * @summary List attendance logs
 */
export declare const listAttendanceLogs: (params?: ListAttendanceLogsParams, options?: RequestInit) => Promise<AttendanceLogsResponse>;
export declare const getListAttendanceLogsQueryKey: (params?: ListAttendanceLogsParams) => readonly ["/api/attendance/logs", ...ListAttendanceLogsParams[]];
export declare const getListAttendanceLogsQueryOptions: <TData = Awaited<ReturnType<typeof listAttendanceLogs>>, TError = ErrorType<unknown>>(params?: ListAttendanceLogsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAttendanceLogs>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listAttendanceLogs>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListAttendanceLogsQueryResult = NonNullable<Awaited<ReturnType<typeof listAttendanceLogs>>>;
export type ListAttendanceLogsQueryError = ErrorType<unknown>;
/**
 * @summary List attendance logs
 */
export declare function useListAttendanceLogs<TData = Awaited<ReturnType<typeof listAttendanceLogs>>, TError = ErrorType<unknown>>(params?: ListAttendanceLogsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAttendanceLogs>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetActiveEmployeesUrl: () => string;
/**
 * @summary Get currently active (checked-in) employees
 */
export declare const getActiveEmployees: (options?: RequestInit) => Promise<ActiveEmployee[]>;
export declare const getGetActiveEmployeesQueryKey: () => readonly ["/api/attendance/active"];
export declare const getGetActiveEmployeesQueryOptions: <TData = Awaited<ReturnType<typeof getActiveEmployees>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getActiveEmployees>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getActiveEmployees>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetActiveEmployeesQueryResult = NonNullable<Awaited<ReturnType<typeof getActiveEmployees>>>;
export type GetActiveEmployeesQueryError = ErrorType<unknown>;
/**
 * @summary Get currently active (checked-in) employees
 */
export declare function useGetActiveEmployees<TData = Awaited<ReturnType<typeof getActiveEmployees>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getActiveEmployees>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateAttendanceLogUrl: (id: string) => string;
/**
 * @summary Update an attendance log entry (admin)
 */
export declare const updateAttendanceLog: (id: string, attendanceLogUpdate: AttendanceLogUpdate, options?: RequestInit) => Promise<AttendanceLog>;
export declare const getUpdateAttendanceLogMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAttendanceLog>>, TError, {
        id: string;
        data: BodyType<AttendanceLogUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateAttendanceLog>>, TError, {
    id: string;
    data: BodyType<AttendanceLogUpdate>;
}, TContext>;
export type UpdateAttendanceLogMutationResult = NonNullable<Awaited<ReturnType<typeof updateAttendanceLog>>>;
export type UpdateAttendanceLogMutationBody = BodyType<AttendanceLogUpdate>;
export type UpdateAttendanceLogMutationError = ErrorType<ErrorResponse>;
/**
* @summary Update an attendance log entry (admin)
*/
export declare const useUpdateAttendanceLog: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAttendanceLog>>, TError, {
        id: string;
        data: BodyType<AttendanceLogUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateAttendanceLog>>, TError, {
    id: string;
    data: BodyType<AttendanceLogUpdate>;
}, TContext>;
export declare const getDeleteAttendanceLogUrl: (id: string) => string;
/**
 * @summary Delete an attendance log entry (admin)
 */
export declare const deleteAttendanceLog: (id: string, options?: RequestInit) => Promise<void>;
export declare const getDeleteAttendanceLogMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteAttendanceLog>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteAttendanceLog>>, TError, {
    id: string;
}, TContext>;
export type DeleteAttendanceLogMutationResult = NonNullable<Awaited<ReturnType<typeof deleteAttendanceLog>>>;
export type DeleteAttendanceLogMutationError = ErrorType<ErrorResponse>;
/**
* @summary Delete an attendance log entry (admin)
*/
export declare const useDeleteAttendanceLog: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteAttendanceLog>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteAttendanceLog>>, TError, {
    id: string;
}, TContext>;
export declare const getGetRecentActivityUrl: (params?: GetRecentActivityParams) => string;
/**
 * @summary Get recent attendance activity
 */
export declare const getRecentActivity: (params?: GetRecentActivityParams, options?: RequestInit) => Promise<AttendanceLog[]>;
export declare const getGetRecentActivityQueryKey: (params?: GetRecentActivityParams) => readonly ["/api/attendance/recent", ...GetRecentActivityParams[]];
export declare const getGetRecentActivityQueryOptions: <TData = Awaited<ReturnType<typeof getRecentActivity>>, TError = ErrorType<unknown>>(params?: GetRecentActivityParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRecentActivity>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getRecentActivity>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetRecentActivityQueryResult = NonNullable<Awaited<ReturnType<typeof getRecentActivity>>>;
export type GetRecentActivityQueryError = ErrorType<unknown>;
/**
 * @summary Get recent attendance activity
 */
export declare function useGetRecentActivity<TData = Awaited<ReturnType<typeof getRecentActivity>>, TError = ErrorType<unknown>>(params?: GetRecentActivityParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRecentActivity>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetDashboardStatsUrl: () => string;
/**
 * @summary Get dashboard KPI statistics
 */
export declare const getDashboardStats: (options?: RequestInit) => Promise<DashboardStats>;
export declare const getGetDashboardStatsQueryKey: () => readonly ["/api/dashboard/stats"];
export declare const getGetDashboardStatsQueryOptions: <TData = Awaited<ReturnType<typeof getDashboardStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDashboardStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDashboardStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getDashboardStats>>>;
export type GetDashboardStatsQueryError = ErrorType<unknown>;
/**
 * @summary Get dashboard KPI statistics
 */
export declare function useGetDashboardStats<TData = Awaited<ReturnType<typeof getDashboardStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map