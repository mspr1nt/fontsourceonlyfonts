import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import type { V2_MetaFunction } from '@remix-run/react';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Install } from '@/components/preview/Install';
import { TabsWrapper } from '@/components/preview/Tabs';
import { ogMeta } from '@/utils/meta';
import { getDownloadCountTotal } from '@/utils/metadata/download.server';
import { getMetadata } from '@/utils/metadata/metadata.server';
import { getVariable } from '@/utils/metadata/variable.server';
import type { Metadata, VariableData } from '@/utils/types';

interface FontMetadata {
	metadata: Metadata;
	variable: VariableData;
	downloadCount: number;
}

export const loader = async ({ params }: LoaderArgs) => {
	const { id } = params;
	invariant(id, 'Missing font ID!');
	const metadata = await getMetadata(id);
	let variable;
	if (metadata.variable) {
		variable = await getVariable(id);
	}
	const downloadCount = await getDownloadCountTotal(id);

	const res: FontMetadata = {
		metadata,
		variable,
		downloadCount,
	};

	return json(res);
};

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
	const title = data?.metadata.family
		? `${data.metadata.family} | Fontsource`
		: 'Fontsource';

	const description = data?.metadata.family
		? `Self-host ${data.metadata.family} in a neatly bundled package.`
		: 'Self-host Open Source fonts in neatly bundled packages.';
	return ogMeta({ title, description });
};

export default function InstallPage() {
	const data = useLoaderData<FontMetadata>();
	const { metadata, variable, downloadCount } = data;

	return (
		<TabsWrapper metadata={metadata} tabsValue="install">
			<Install
				metadata={metadata}
				variable={variable}
				downloadCount={downloadCount}
			/>
		</TabsWrapper>
	);
}
