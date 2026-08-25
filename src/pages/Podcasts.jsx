import { Helmet } from "react-helmet-async";
import PodcastLayout from "@/components/blog/PodcastLayout";

export default function Podcasts() {
  return (
    <>
      <Helmet>
        <title>Podcasts de Raúl Ruiz — Antiagencia</title>
        <meta
          name="description"
          content="Todos los podcasts en los que ha aparecido Raúl Ruiz. Email marketing, ventas y negocios sin filtros."
        />
        <link rel="canonical" href="https://antiagencia.es/podcasts" />
      </Helmet>

      <PodcastLayout>
        <p className="text-gray-400 text-center py-20">Próximamente.</p>
      </PodcastLayout>
    </>
  );
}
