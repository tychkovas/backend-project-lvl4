// @ts-check

module.exports = {
  translation: {
    appName: 'JUST DO IT',
    title: 'Твой Менеджер Задач',
    flash: {
      session: {
        create: {
          success: 'Вы залогинены',
          error: 'Неправильный имейл или пароль',
        },
        delete: {
          success: 'Вы разлогинены',
        },
      },
      users: {
        create: {
          error: 'Не удалось зарегистрировать',
          success: 'Пользователь успешно зарегистрирован',
        },
        edit: {
          error: 'Не удалось изменить пользователя',
          success: 'Пользователь успешно изменён',
        },
        delete: {
          error: 'Не удалось удалить пользователя',
          success: 'Пользователь успешно удалён',
        },
        accessError: 'Вы не можете редактировать или удалять другого пользователя',
      },
      statuses: {
        create: {
          error: 'Не удалось создать статус',
          success: 'Статус успешно создан',
        },
        edit: {
          error: 'Не удалось изменить статус',
          success: 'Статус успешно изменён',
        },
        delete: {
          error: 'Не удалось удалить статус',
          success: 'Статус успешно удалён',
        },
      },
      tasks: {
        create: {
          error: 'Не удалось создать задачу',
          success: 'Задача успешно создана',
        },
        edit: {
          error: 'Не удалось изменить задачу',
          success: 'Задача успешно изменeна',
        },
        delete: {
          error: 'Не удалось удалить задачу',
          accessError: 'Задачу может удалить только её автор',
          success: 'Задача успешно удалена',
        },
      },
      authError: 'Доступ запрещён! Пожалуйста, авторизируйтесь.',
    },
    layouts: {
      application: {
        home: 'Главная',
        users: 'Пользователи',
        statuses: 'Статусы',
        tasks: 'Задачи',
        signIn: 'Вход',
        signUp: 'Регистрация',
        signOut: 'Выход',
      },
    },
    views: {
      session: {
        new: {
          signIn: 'Вход',
          submit: 'Войти',
        },
      },
      statuses: {
        id: 'ID',
        name: 'Наименование',
        createdAt: 'Дата создания',
        actions: {
          edit: 'Изменить',
          delete: 'Удалить',
          new: 'Создать статус',
        },
        new: {
          header: 'Создание статуса',
          submit: 'Создать',
        },
        edit: {
          header: 'Изменение статуса',
          submit: 'Изменить',
        },
      },

      tasks: {
        id: 'ID',
        name: 'Наименование',
        description: 'Описание',
        status: 'Статус',
        creator: 'Автор',
        executor: 'Исполнитель',
        createdAt: 'Дата создания',
        actions: {
          edit: 'Изменить',
          delete: 'Удалить',
          new: 'Создать задачу',
        },
        new: {
          header: 'Создание задачи',
          submit: 'Создать',
        },
        edit: {
          header: 'Изменение задачи',
          submit: 'Изменить',
        },
      },

      users: {
        id: 'ID',
        firstName: 'Имя',
        lastName: 'Фамилия',
        fullName: 'Полное имя',
        email: 'Email',
        password: 'Пароль',
        createdAt: 'Дата создания',
        actions: {
          edit: 'Изменить',
          delete: 'Удалить',
        },
        new: {
          submit: 'Сохранить',
          signUp: 'Регистрация',
        },
        edit: {
          submit: 'Сохранить',
          heading: 'Изменение пользователя',
        },
      },
      welcome: {
        index: {
          hello: 'Привет это Ваш Менеджер задач "JUST DO IT"!',
          description: 'Проект по программированию от Хекслета!',
          more: 'Узнать Больше',
        },
      },
    },
  },
};
