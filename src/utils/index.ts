export const getAtt = (
  resourceName: string,
  attribute: string,
): { 'Fn::GetAtt': string[] } => ({
  'Fn::GetAtt': [resourceName, attribute],
})

export const getArn = (resourceName: string): Record<'Fn::GetAtt', string[]> =>
  getAtt(resourceName, 'Arn')

export const env = <T extends string>(name: T) =>
  `\${self:provider.environment.${name}}` as const

export const INTERNAL_STAGE = '${sls:stage}'

export const join = (
  delimiter: string,
  ...strings: (string | ReturnType<typeof getAtt>)[]
): Record<'Fn::Join', unknown> => ({
  'Fn::Join': [delimiter, strings],
})

export const importValue = (
  exportName: string,
): { 'Fn::ImportValue': string } => ({
  'Fn::ImportValue': exportName,
})

type CFString =
  | ReturnType<typeof getAtt>
  | ReturnType<typeof join>
  | ReturnType<typeof importValue>

export const iamAllow = (
  action: string | string[],
  resource: string | CFString | (string | CFString)[],
) => ({
  Effect: 'Allow',
  Action: Array.isArray(action) ? action : [action],
  Resource: Array.isArray(resource) ? resource : [resource],
})
