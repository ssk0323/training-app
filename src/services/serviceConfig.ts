import { apiTrainingMenuService } from './apiTrainingMenuService'
import { apiTrainingRecordService } from './apiTrainingRecordService'
import { trainingMenuService } from './trainingMenuService'
import { trainingRecordService } from './trainingRecordService'

// APIベースのサービスが利用可能かどうかをチェック
const isApiAvailable = () => {
  const apiUrl =
    import.meta.env.VITE_API_BASE_URL ||
    'https://training-app.kenzo-sasaki-02.workers.dev'
  return !!apiUrl
}

// トレーニングメニューサービスの取得
export const getTrainingMenuService = () => {
  return isApiAvailable() ? apiTrainingMenuService : trainingMenuService
}

// トレーニング記録サービスの取得
export const getTrainingRecordService = () => {
  return isApiAvailable() ? apiTrainingRecordService : trainingRecordService
}

// 現在のサービス設定を取得
export const getServiceConfig = () => {
  return {
    useApi: isApiAvailable(),
    apiUrl:
      import.meta.env.VITE_API_BASE_URL ||
      'https://training-app.kenzo-sasaki-02.workers.dev',
  }
}
