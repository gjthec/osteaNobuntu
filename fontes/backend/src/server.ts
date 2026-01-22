import app from './app';
import showTime from './utils/showTime.util';
import { GetDefaultTenantConnectionUseCase } from './useCases/tenant/getDefaultTenantConnection.useCase';
import { GetSecurityTenantConnectionUseCase } from './useCases/tenant/getSecurityTenantConnection.useCase';
import { printErrorChain } from './utils/errorChain.util';

const PORT = process.env.PORT_SERVER || 8080;

async function startServer() {
	try {
		//Realiza conexão no banco de dados de segurança
		const getSecurityTenantConnectionUseCase =
			new GetSecurityTenantConnectionUseCase();
		const securityTenant = await getSecurityTenantConnectionUseCase.execute();

		//Realiza conexão no banco de dados padrão
		const getDefaultTenantConnectionUseCase =
			new GetDefaultTenantConnectionUseCase();
		const defaultTenant = await getDefaultTenantConnectionUseCase.execute();

    //Aqui realiza operações de interesse antes da API iniciar

		app.listen(PORT, () => {
			showTime();
			console.log(`Server running on ${PORT}`);
		});
	} catch (error) {
		printErrorChain(error);
	}
}

startServer();