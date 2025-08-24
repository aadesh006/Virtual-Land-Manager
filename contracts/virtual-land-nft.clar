(define-non-fungible-token virtual-land uint)
(define-data-var last-token-id uint u0)
(define-constant contract-owner tx-sender)

(define-public (mint-land (recipient principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) (err u100))
    (let ((next-id (+ (var-get last-token-id) u1)))
      (try! (nft-mint? virtual-land next-id recipient))
      (var-set last-token-id next-id)
      (ok next-id))))

(define-public (transfer-land (token-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) (err u101))
    (asserts! (is-eq (unwrap! (nft-get-owner? virtual-land token-id) (err u103)) sender) (err u104))
    (nft-transfer? virtual-land token-id sender recipient)))

(define-read-only (get-last-token-id)
  (ok (var-get last-token-id)))

(define-read-only (get-owner (token-id uint))
  (nft-get-owner? virtual-land token-id))