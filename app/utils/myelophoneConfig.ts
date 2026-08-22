import type { MyelophoneClientConfig } from '~/types/myelophone';

export const useMyelophoneConfig = (): MyelophoneClientConfig =>
	__MYELOPHONE_CONFIG__;
