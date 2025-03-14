import { LS_PREFIX } from './constants';

type Config = {
  railwayToken: string;
  railwayProjectId: string;
};

export const getConfig = () => {
  const railwayToken = localStorage.getItem(`${LS_PREFIX}/railway-token`);

  const railwayProjectId = localStorage.getItem(
    `${LS_PREFIX}/railway-project-id`
  );

  return {
    railwayToken,
    railwayProjectId,
  };
};

export const setConfig = (config: Config) => {
  localStorage.setItem(`${LS_PREFIX}/railway-token`, config.railwayToken);
  localStorage.setItem(
    `${LS_PREFIX}/railway-project-id`,
    config.railwayProjectId
  );
};
