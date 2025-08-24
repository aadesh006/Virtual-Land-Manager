(define-map listings uint (tuple (price uint) (seller principal)))

(define-public (list-land (token-id uint) (price uint))
  (begin
    (try! (contract-call? 'STP6Q28EQWFYHVXWWW4W0E6M1Z7GJ9WVRQB33C7E.virtual-land-nft transfer-land token-id tx-sender (as-contract tx-sender)))
    (map-set listings token-id { price: price, seller: tx-sender })
    (ok true)))

(define-public (unlist-land (token-id uint))
  (let ((listing (unwrap! (map-get? listings token-id) (err u200)))
        (seller (get seller listing)))
    (asserts! (is-eq tx-sender seller) (err u201))
    (try! (as-contract (contract-call? 'STP6Q28EQWFYHVXWWW4W0E6M1Z7GJ9WVRQB33C7E.virtual-land-nft transfer-land token-id (as-contract tx-sender) seller)))
    (map-delete listings token-id)
    (ok true)))

(define-public (buy-land (token-id uint))
  (let ((listing (unwrap! (map-get? listings token-id) (err u300)))
        (price (get price listing))
        (seller (get seller listing)))
    (try! (stx-transfer? price tx-sender seller))
    ;; V-- THIS ADDRESS IS NOW UPDATED --V
    (try! (as-contract (contract-call? 'STP6Q28EQWFYHVXWWW4W0E6M1Z7GJ9WVRQB33C7E.virtual-land-nft transfer-land token-id (as-contract tx-sender) tx-sender)))
    (map-delete listings token-id)
    (ok true)))

(define-read-only (get-listing (token-id uint))
  (map-get? listings token-id))