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
        delete: 'Не удалось удалить статус',
      },
      authError: 'Доступ запрещён! Пожалуйста, авторизируйтесь.',
    },
    layouts: {
      application: {
        home: 'Главная',
        users: 'Пользователи',
        statuses: 'Статусы',
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
