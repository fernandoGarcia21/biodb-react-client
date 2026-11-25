import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { paths } from '@/paths';
import Link from '@mui/material/Link';

export const contactZoneGuidance = 'Indicates whether the sampling area encompasses a contact zone between divergent ecotypes, as evidenced by the spatial distribution of different ecotypes within its boundaries. This flag is set to Yes only when the sampling area spans such a contact zone, rather than being located within or adjacent to one. This classification is independent of habitat characteristics and habitat structure and is most likely to apply to long transects. The presence of distinct habitat patches or environmental transitions does not necessarily indicate an ecotype contact zone.';

export const descriptionGuidance = 'The field description of the sampling area should includ additional information bout the spatial arrangement of habitat types, the nature of any transitions or boundaries, and relevant environmental variation. This information should help clarify potential ambiguities in the habitat code and habitat structure classification.';

export const photographGuidance = 'If available, a photograph shows the sampling area and the spatial arrangement of its habitats. Photographs can help clarify habitat classifications, particularly when distinct patches or environmental transitions are present.';

export function SamplingAreaGuidelines(): React.JSX.Element {
  return (
    <Alert severity="info" sx={{ mb: 3 }}>
      <AlertTitle>Habitat classification guidelines</AlertTitle>
      Habitat codes describe environmental characteristics, while habitat structure describes their spatial arrangement.
      {' '}Contact-zone status refers independently to the potential contact between divergent ecotypes.
      {' '}Use the <strong>description</strong> field to provide additional information and clarify classifications.
      {' '}If information is insufficient, consult the responsible person listed on the <Link href={paths.dashboard.projects}>Projects page</Link> whenever possible.
    </Alert>
  );
}
