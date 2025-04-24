import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/http',
    'src/config',
    'src/types/index',
  ],
  clean: true,
  declaration: 'node16',
})
