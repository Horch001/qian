import React from 'react';
import { X, AlertTriangle, Shield, Eye } from 'lucide-react';

interface ReviewRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'merchant' | 'product';
}

export const ReviewRulesModal: React.FC<ReviewRulesModalProps> = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  const title = type === 'merchant' ? '商家入驻审核规则' : '商品上架审核规则';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-6">
          {/* AI自动审核提示 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <Shield className="text-blue-600 flex-shrink-0" size={24} />
            <div>
              <h3 className="font-bold text-blue-900 mb-1">AI自动审核</h3>
              <p className="text-sm text-blue-800">
                本平台采用AI智能审核系统，提交后将自动进行审核。符合规则的申请将在几分钟内自动通过。
              </p>
            </div>
          </div>

          {/* 保证金说明 */}
          {type === 'merchant' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-bold text-green-900 mb-2">💰 保证金说明</h3>
              <div className="text-sm text-green-800 space-y-1">
                <p>• 提交申请时将扣除保证金（具体金额以系统提示为准）</p>
                <p>• 审核不通过：保证金立即原路退还</p>
                <p>• 审核通过后：正常营业期间，只要没有未完成订单，随时可以申请退还保证金</p>
                <p>• 违规处罚：严重违规将扣除保证金</p>
              </div>
            </div>
          )}

          {/* 审核标准 */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3">审核标准</h3>
            <div className="space-y-2 text-sm text-gray-700">
              {type === 'merchant' ? (
                <>
                  <div className="flex gap-2">
                    <span className="text-green-600">✓</span>
                    <span>店铺名称真实、规范，不少于2个字符</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-green-600">✓</span>
                    <span>店铺描述清晰，能够表达清楚经营内容即可（建议尽可能详细）</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-green-600">✓</span>
                    <span>提供有效的邮箱地址（用于接收通知）</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-green-600">✓</span>
                    <span>企业主体需上传营业执照</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-green-600">✓</span>
                    <span>不包含违禁词和敏感内容</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex gap-2">
                    <span className="text-green-600">✓</span>
                    <span>商品标题清晰明确，不少于2个字符</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-green-600">✓</span>
                    <span>商品描述详细，不少于10个字符</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-green-600">✓</span>
                    <span>至少上传1张商品图片</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-green-600">✓</span>
                    <span>价格合理，大于0</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-green-600">✓</span>
                    <span>库存数量合理</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-green-600">✓</span>
                    <span>不包含违禁词和敏感内容</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 违禁内容 */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3">严禁发布以下内容</h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
              <div className="flex gap-2">
                <span className="text-red-600">✗</span>
                <span>政治敏感内容</span>
              </div>
              <div className="flex gap-2">
                <span className="text-red-600">✗</span>
                <span>色情低俗内容</span>
              </div>
              <div className="flex gap-2">
                <span className="text-red-600">✗</span>
                <span>赌博诈骗信息</span>
              </div>
              <div className="flex gap-2">
                <span className="text-red-600">✗</span>
                <span>违法违规商品</span>
              </div>
              <div className="flex gap-2">
                <span className="text-red-600">✗</span>
                <span>虚假宣传</span>
              </div>
              <div className="flex gap-2">
                <span className="text-red-600">✗</span>
                <span>侵权盗版内容</span>
              </div>
            </div>
          </div>

          {/* 后审核机制 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-3">
              <Eye className="text-yellow-600 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-bold text-yellow-900 mb-2">后审核机制</h3>
                <div className="text-sm text-yellow-800 space-y-1">
                  <p>• 即使通过自动审核，平台管理员仍会进行人工抽查</p>
                  <p>• 发现违规内容将立即下架或关闭店铺</p>
                  <p>• 严重违规者将被永久封禁，保证金不予退还</p>
                  <p>• 请务必遵守平台规则，诚信经营</p>
                </div>
              </div>
            </div>
          </div>

          {/* 违规处罚 */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertTriangle className="text-red-600 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-bold text-red-900 mb-2">违规处罚</h3>
                <div className="text-sm text-red-800 space-y-1">
                  <p>• 轻微违规：警告并要求整改</p>
                  <p>• 一般违规：下架商品或暂停店铺</p>
                  <p>• 严重违规：关闭店铺，扣除保证金</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors"
          >
            我已阅读并同意遵守规则
          </button>
        </div>
      </div>
    </div>
  );
};
