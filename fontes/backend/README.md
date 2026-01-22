VersionFramework:1

Forma que é organizado o projeto:

Domain:
  Entities: Entidades formalizadas.
  Repositories: Classes com a definição de operações com banco de dados;
  Services: Classes com a definição de funções externas (Serviços de pagamento, serviços de envio de e-mail e etc);
Infra (implementações):
  Cache: Implementação de funcionalidades de uso de cache;
  Database: Implementação de funcionalidade de uso de banco de dados;
  HTTP:
    Controllers: Recebe requisição, chama o caso de uso (ou repository);
    Middlewares: Implementações de funções que devem ocorrer antes ou depois do envio das respostas para o usuário nas requisições;
    Routes: Implementações das rotas que direcionam a requisição para os controlles;
    Validators: Validam se os dados enviados nas requisições estão corretos;
  UseCases: Implementa a lógica de negócio;
  Utils:
Service: Só use se não estiver usando Clean Architecture, ou se for um serviço externo (ex: EmailService, PaymentService).