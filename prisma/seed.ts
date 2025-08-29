import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes (opcional - cuidado em produção!)
  await prisma.userProject.deleteMany();
  await prisma.userArea.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  await prisma.area.deleteMany();

  // Criar áreas
  console.log('📁 Criando áreas...');
  const areas = await prisma.area.createMany({
    data: [
      {
        name: 'Frontend',
        description: 'Desenvolvimento de interfaces de usuário'
      },
      {
        name: 'Backend',
        description: 'Desenvolvimento de APIs e lógica de servidor'
      },
      {
        name: 'Design',
        description: 'UI/UX Design e identidade visual'
      },
      {
        name: 'Infraestrutura',
        description: 'DevOps, Cloud e infraestrutura'
      },
      {
        name: 'Requisitos',
        description: 'Análise de requisitos e documentação'
      },
      {
        name: 'Gestão',
        description: 'Gestão de projetos e pessoas'
      }
    ]
  });

  // Buscar áreas criadas para usar os IDs
  const frontendArea = await prisma.area.findFirst({ where: { name: 'Frontend' } });
  const backendArea = await prisma.area.findFirst({ where: { name: 'Backend' } });
  const designArea = await prisma.area.findFirst({ where: { name: 'Design' } });
  const infraArea = await prisma.area.findFirst({ where: { name: 'Infraestrutura' } });
  const requirementsArea = await prisma.area.findFirst({ where: { name: 'Requisitos' } });
  const managementArea = await prisma.area.findFirst({ where: { name: 'Gestão' } });

  // Criar usuários
  console.log('👥 Criando usuários...');
  
  // Gestor principal
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin Silva',
      email: 'admin@empresa.com',
      password: await bcrypt.hash('123456', 12),
      age: 35,
      contractType: 'CLT',
      role: 'MANAGER'
    }
  });

  // Colaboradores normais
  const devFrontend = await prisma.user.create({
    data: {
      name: 'João Frontend',
      email: 'joao@empresa.com',
      password: await bcrypt.hash('123456', 12),
      age: 28,
      contractType: 'CLT',
      role: 'NORMAL'
    }
  });

  const devBackend = await prisma.user.create({
    data: {
      name: 'Maria Backend',
      email: 'maria@empresa.com',
      password: await bcrypt.hash('123456', 12),
      age: 30,
      contractType: 'PJ',
      role: 'NORMAL'
    }
  });

  const designer = await prisma.user.create({
    data: {
      name: 'Pedro Designer',
      email: 'pedro@empresa.com',
      password: await bcrypt.hash('123456', 12),
      age: 26,
      contractType: 'FREELANCER',
      role: 'NORMAL'
    }
  });

  const fullStack = await prisma.user.create({
    data: {
      name: 'Ana Fullstack',
      email: 'ana@empresa.com',
      password: await bcrypt.hash('123456', 12),
      age: 32,
      contractType: 'CLT',
      role: 'NORMAL'
    }
  });

  // Associar usuários às áreas
  console.log('🔗 Associando usuários às áreas...');
  
  if (managementArea) {
    await prisma.userArea.create({
      data: {
        userId: adminUser.id,
        areaId: managementArea.id
      }
    });
  }

  if (frontendArea) {
    await prisma.userArea.createMany({
      data: [
        { userId: devFrontend.id, areaId: frontendArea.id },
        { userId: fullStack.id, areaId: frontendArea.id }
      ]
    });
  }

  if (backendArea) {
    await prisma.userArea.createMany({
      data: [
        { userId: devBackend.id, areaId: backendArea.id },
        { userId: fullStack.id, areaId: backendArea.id }
      ]
    });
  }

  if (designArea) {
    await prisma.userArea.create({
      data: {
        userId: designer.id,
        areaId: designArea.id
      }
    });
  }

  // Criar projetos
  console.log('🚀 Criando projetos...');
  
  const projeto1 = await prisma.project.create({
    data: {
      name: 'Sistema de Vendas',
      description: 'Sistema completo de vendas online',
      deadline: new Date('2024-12-31'),
      technologies: ['React', 'Node.js', 'PostgreSQL'],
      status: 'DEVELOPMENT'
    }
  });

  const projeto2 = await prisma.project.create({
    data: {
      name: 'App Mobile',
      description: 'Aplicativo mobile para clientes',
      deadline: new Date('2025-03-15'),
      technologies: ['React Native', 'Express', 'MongoDB'],
      status: 'PLANNING'
    }
  });

  // Associar usuários aos projetos
  console.log('👨‍💻 Associando usuários aos projetos...');
  
  await prisma.userProject.createMany({
    data: [
      // Projeto 1
      { userId: adminUser.id, projectId: projeto1.id, roleInProject: 'Gestor do Projeto' },
      { userId: devFrontend.id, projectId: projeto1.id, roleInProject: 'Desenvolvedor Frontend' },
      { userId: devBackend.id, projectId: projeto1.id, roleInProject: 'Desenvolvedor Backend' },
      { userId: designer.id, projectId: projeto1.id, roleInProject: 'UI/UX Designer' },
      
      // Projeto 2
      { userId: adminUser.id, projectId: projeto2.id, roleInProject: 'Gestor do Projeto' },
      { userId: fullStack.id, projectId: projeto2.id, roleInProject: 'Desenvolvedor Fullstack' },
      { userId: designer.id, projectId: projeto2.id, roleInProject: 'UI/UX Designer' }
    ]
  });

  console.log('✅ Seed concluído com sucesso!');
  console.log('\n📊 Dados criados:');
  console.log('- 6 áreas de atuação');
  console.log('- 5 usuários (1 gestor + 4 colaboradores)');
  console.log('- 2 projetos');
  console.log('\n🔐 Credenciais de acesso:');
  console.log('Admin: admin@empresa.com / 123456');
  console.log('João: joao@empresa.com / 123456');
  console.log('Maria: maria@empresa.com / 123456');
  console.log('Pedro: pedro@empresa.com / 123456');
  console.log('Ana: ana@empresa.com / 123456');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });