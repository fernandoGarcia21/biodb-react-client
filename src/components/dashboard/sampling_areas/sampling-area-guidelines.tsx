import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { paths } from '@/paths';
import Link from '@mui/material/Link';

export const contactZoneGuidance = 'Indicates whether the sampling area is located within a contact zone between divergent ecotypes, where individuals of different ecotypes may meet and potentially interbreed. This classification is independent of habitat characteristics and habitat structure. The presence of distinct habitat patches or environmental transitions does not necessarily indicate an ecotype contact zone.';

export const descriptionGuidance = 'The field description of the sampling area should includ additional information bout the spatial arrangement of habitat types, the nature of any transitions or boundaries, and relevant environmental variation. This information should help clarify potential ambiguities in the habitat code and habitat structure classification.';

export const photographGuidance = 'If available, a photograph shows the sampling area and the spatial arrangement of its habitats. Photographs can help clarify habitat classifications, particularly when distinct patches or environmental transitions are present.';

export function SamplingAreaGuidelines(): React.JSX.Element {
  return (
    <Alert severity="info" sx={{ mb: 3 }}>
      <AlertTitle>Habitat classification guidelines</AlertTitle>
      Habitat codes describe environmental characteristics, while habitat structure describes their spatial arrangement.
      {' '}Contact-zone status refers independently to the potential contact between divergent ecotypes.
      {' '}Sampling area description provides additional information to clarify classifications.
      {' '}If information is insufficient, consult the responsible person listed on the <Link href={paths.dashboard.projects}>Projects page</Link> whenever possible.
    </Alert>
  );
}
